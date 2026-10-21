# FinanSight — notas de arquitetura

Documento complementar ao `README.md`, com o detalhe de decisões de projeto que
não coubem na introdução principal.

---

## 1. Divisão de responsabilidades

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  Front-end (Angular 21)    │  HTTP  │  Back-end (Spring Boot 3.5)  │
│                            │ ─────► │                              │
│  • apresentação             │  JWT   │  • autenticação/autorização   │
│  • formulários e validação  │ ◄───── │  • regras de negócio         │
│  • gráficos (Chart.js)      │  JSON  │  • agregações (SQL)          │
│  • design system Midnight   │        │  • persistência (JPA/Flyway) │
└────────────────────────────┘        └──────────────┬───────────────┘
                                                     │
                                          ┌──────────▼──────────┐
                                          │   PostgreSQL 14+    │
                                          └─────────────────────┘
```

**O front-end nunca recalcula um indicador.** Saldo, economia, percentual de
orçamento e progresso de meta são calculados no servidor e devolvidos prontos.
Isso evita divergência entre a tela e o banco e permite testar as regras com
JUnit/Mockito.

## 2. Segurança

| Camada | Mecanismo |
| --- | --- |
| Senha | BCrypt (custo 12) — `SecurityConfig#passwordEncoder` |
| Sessão | JWT HS256 stateless, expiração configurável (`FINANSIGHT_JWT_EXPIRATION_MINUTES`) |
| Transporte | `Authorization: Bearer <token>` injetado por `authInterceptor` |
| Autorização | `CurrentUserProvider` resolve o usuário do `SecurityContext`; **todo** repositório é filtrado por `user_id` |
| Validação | Bean Validation nas requisições + `GlobalExceptionHandler` padronizando as respostas |
| CORS | Apenas as origens de `FINANSIGHT_ALLOWED_ORIGINS` |

O isolamento entre usuários foi verificado com duas contas reais: a segunda
conta não enxerga transações, categorias nem orçamentos da primeira
(`404` em recursos alheios).

## 3. Modelo de dados

```
users ─┬─< categories ─< transactions
       │        ▲
       ├─< budgets ─┘
       ├─< financial_goals ─< goal_contributions
       └─< transactions
```

Decisões relevantes:

- Valores monetários em `numeric(19,2)` — centavos exatos, sem arredondamento
  binário.
- `transactions.category_id` com `ON DELETE RESTRICT`: uma categoria em uso não
  pode sumir do banco; a API orienta a desativação em vez da exclusão.
- `budgets` tem chave única `(user_id, category_id, period)`, com `period`
  sempre no primeiro dia do mês.
- `goal_contributions` guarda o histórico; o acumulado da meta é a soma das
  contribuições, recalculada a cada lançamento.

## 4. Consultas agregadas

O dashboard e os relatórios usam agregações no banco (nunca em memória):

| Consulta | Finalidade |
| --- | --- |
| `sumByTypeInPeriod` | Receitas/despesas do período (com filtro opcional de categoria) |
| `sumBalanceUntil` | Saldo acumulado até o fim do período |
| `sumExpensesGroupedByCategory` | Distribuição por categoria |
| `sumExpensesByCategoryInPeriod` | Gasto de um orçamento |
| `monthlyEvolution` / `dailyEvolution` | Série temporal (agrupada por `EXTRACT`) |
| `countByCategoryIdAndUserId` | Quantidade de lançamentos por categoria |

A listagem de transações usa **Specifications** do Spring Data JPA para
combinar busca textual, tipo, categoria, período e ordenação em uma única
consulta parametrizada (sem concatenação de SQL).

## 5. Front-end

### Organização

```
core/       modelo, cliente HTTP único (FinanceApi), interceptor, guard, formatos
layout/     app-shell (sidebar + topbar + router-outlet)
shared/     design system reutilizável (stat-card, trend-indicator, progress-meter,
            empty-state, page-header, finance-chart, period-selector, confirm-dialog,
            auth-layout, brand-logo)
features/   telas, uma por área
styles/     _tokens.scss (CSS custom properties) + midnight-theme.ts (preset PrimeNG)
```

### Por que o preset do PrimeNG é reescrito

O tema padrão do PrimeNG (Aura) tem contrastes, raios e cores de acento que
não combinam com a paleta Midnight. `midnight-theme.ts` substitui:

- **tokens semânticos** do esquema `dark`: superfícies, textos, campos de
  formulário, overlays, highlight e navegação;
- **tokens de componente**: botões (incluindo variantes `outlined` e `text`),
  inputs, selects, tabelas, diálogos, toasts, paginador, barras de progresso,
  calendário, menus, tooltips, tags e checkboxes.

O restante (alturas de linha, espaçamento interno, tabelas, foco visível,
animações de diálogo e toast) é ajustado em `styles.scss` com seletores
globais de baixa especificidade.

### Gráficos

`fs-finance-chart` encapsula o Chart.js:

- **Linha** (evolução): área sutil, linhas de 2px, grade discreta, tooltips
  com a paleta do produto.
- **Barras** (evolução mensal).
- **Rosca** (distribuição): legenda em HTML ao lado, com valor e percentual —
  mais legível e acessível do que rótulos dentro das fatias.

Agrupamento automático: períodos de até 31 dias são agrupados por dia;
períodos maiores, por mês.

### Acessibilidade

- Todos os campos têm `<label for>` associado.
- Foco visível (`:focus-visible` com contorno de 2px na cor de destaque).
- Estados de erro com texto, não apenas cor.
- Ícones decorativos com `aria-hidden`; botões de ícone com `aria-label`.
- Gráficos com `role="img"` e `aria-label` descritivo.
- `prefers-reduced-motion` respeitado globalmente.

## 6. Dados de demonstração

`DemoDataSeeder` só é executado com `finansight.demo.enabled=true` e cria uma
conta dedicada (`demo@finansight.app`) com 6 meses de histórico, 9 categorias,
4 orçamentos e 3 metas com contribuições. Nenhum dado de demonstração é
misturado com a conta de um usuário real — o seed é idempotente e só age se a
conta de demonstração ainda não existir.

## 7. O que poderia evoluir

- Envio de e-mail transacional para recuperação de senha.
- Importação de extratos bancários (OFX/CSV) com deduplicação.
- Metas compartilhadas entre household (familiar).
- Relatórios comparando anos distintos.
- Cache das agregações do dashboard para grandes volumes de dados.
