# FinanSight

**Seu futuro financeiro em boas mãos.**

FinanSight é uma plataforma SaaS de gestão e inteligência financeira pessoal.
O projeto combina uma API Java/Spring Boot com uma interface Angular em um
design system autoral escuro chamado **Midnight**.

> O back-end é a fonte de verdade: todos os cálculos financeiros, validações de
> negócio e regras de permissão são executados no servidor. A interface apenas
> apresenta os resultados.

---

## Sumário

- [Objetivo do projeto](#objetivo-do-projeto)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Identidade visual — Midnight](#identidade-visual--midnight)
- [Regras de negócio](#regras-de-negócio)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Configuração de ambiente](#configuração-de-ambiente)
- [Executando o sistema](#executando-o-sistema)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)
- [Capturas de tela](#capturas-de-tela)
- [Segurança](#segurança)
- [Decisões técnicas](#decisões-técnicas)
- [Funcionalidades incompletas ou limitações](#funcionalidades-incompletas-ou-limitações)
- [Licença](#licença)

---

## Objetivo do projeto

O FinanSight nasceu para responder a uma pergunta simples: **para onde está
indo o meu dinheiro?** A plataforma permite registrar receitas e despesas,
organizar lançamentos em categorias, definir limites mensais de gasto,
criar metas de economia e analisar a evolução do patrimônio financeiro ao
longo do tempo.

O projeto foi construído como um produto real, e não como uma maquete: todos
os botões executam ação, todos os formulários validam e persistem, todos os
filtros alteram os resultados e todos os números exibidos vêm do banco de dados.

## Tecnologias

### Back-end

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| Java | 21 | Linguagem principal |
| Spring Boot | 3.5.16 | Framework da aplicação |
| Spring Web | 3.5.16 | Controllers REST |
| Spring Data JPA | 3.5.16 | Persistência e repositórios |
| Spring Security | 6.5.x | Autenticação e autorização |
| Spring Validation | 3.5.16 | Validação de entrada |
| JJWT | 0.12.7 | Emissão e validação de tokens JWT |
| PostgreSQL | 14+ | Banco de dados relacional |
| Flyway | 11.x | Migrações versionadas de schema |
| Springdoc OpenAPI | 2.9.1 | Documentação Swagger da API |
| JUnit 5 / Mockito | 5.x | Testes automatizados |

### Front-end

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| Angular | 21.2 | Framework (standalone, signals, controle de fluxo nativo) |
| TypeScript | 5.9 | Tipagem estrita |
| PrimeNG | 21.1 | Biblioteca de componentes (totalmente customizada) |
| PrimeIcons | 7.0 | Ícones |
| @primeuix/themes | 2.0 | Base para o preset "Midnight" |
| Chart.js | 4.5 | Gráficos financeiros |
| SCSS | — | Design system based em tokens |

## Funcionalidades

### Autenticação

- Cadastro de conta com nome, e-mail e senha.
- Login com token JWT (HS256) e expiração configurável.
- Senhas armazenadas **apenas** como hash BCrypt (custo 12).
- Troca de senha exigindo a senha atual.
- Sessão restaurada ao recarregar a página; expiração devolve o usuário ao login.
- Guardas de rota no front-end **e** validação de autorização no back-end.

### Dashboard

- Saudação personalizada e seletor de período (mês, 3/6/12 meses, personalizado).
- Indicadores: saldo atual, receitas, despesas e economia do período, com
  comparação percentual contra o período anterior.
- Gráfico de evolução de receitas e despesas (diário até 31 dias, mensal acima).
- Gráfico de rosca com a distribuição de despesas por categoria.
- Transações recentes, metas em andamento e consumo dos orçamentos do mês.

### Transações

- Listagem paginada com busca por descrição/observações, filtro por tipo,
  filtro por categoria, intervalo de datas e ordenação.
- Formulário de criação e edição com validação de descrição, valor, tipo,
  categoria, data e observações.
- Exclusão com modal de confirmação.
- Estados de carregamento, sucesso e erro.

### Categorias

- Cadastro, edição, ativação/desativação e exclusão.
- Cada categoria aceita apenas um tipo (receita ou despesa) e a API recusa
  lançamentos incompatíveis.
- Categorias com transações vinculadas não podem ser excluídas — devem ser
  desativadas.

### Orçamentos

- Limite mensal por categoria de despesa.
- Gasto, valor restante e percentual utilizado calculados pelo back-end.
- Situação: **Em dia** (< 70%), **Atenção** (70%–100%) e **Excedido** (> 100%).
- Histórico por período.

### Metas financeiras

- Nome, valor desejado, data de início, prazo e descrição.
- Registro de contribuições, com histórico por meta.
- Percentual concluído, valor restante, metas concluídas e metas atrasadas.
- Status da meta (`ATIVA`, `CONCLUIDA`, `CANCELADA`) atribuído pelo servidor.

### Relatórios

- Total de receitas, despesas e saldo do período.
- Evolução mensal, distribuição por categoria e comparação entre períodos.
- Filtros de data e categoria.
- Exportação CSV (com BOM UTF-8, separador `;` e formato brasileiro).

### Configurações

- Perfil: nome, renda mensal e meta de economia.
- Alteração de senha.
- Dados da conta (moeda, data de criação).

## Identidade visual — Midnight

A direção de arte **Midnight** foi desenhada para o FinanSight e não reaproveita
nenhum template pronto.

### Paleta

| Token | Valor | Uso |
| --- | --- | --- |
| `--fs-bg-primary` | `#07111F` | Fundo da página |
| `--fs-bg-secondary` | `#0A1524` | Menu lateral, superfícies de apoio |
| `--fs-surface` | `#0D192A` | Cartões |
| `--fs-surface-elevated` | `#101E32` | Elementos sobre cartões |
| `--fs-surface-selected` | `#172A44` | Item ativo, seleção |
| `--fs-border` | `#20314A` | Bordas |
| `--fs-accent` | `#6B8EFF` | Azul principal (ações, gráficos) |
| `--fs-accent-soft` | `#8FB3D9` | Azul secundário |
| `--fs-accent-light` | `#B8D3F5` | Azul claro (destaques) |
| `--fs-text-primary` | `#E8EEF7` | Texto principal |
| `--fs-text-secondary` | `#91A1B8` | Texto auxiliar |
| `--fs-text-muted` | `#71839B` | Texto discreto |
| `--fs-success` | `#48C6AD` | Receitas, dentro do orçamento |
| `--fs-danger` | `#E58B93` | Despesas, exclusão |
| `--fs-warning` | `#D9B779` | Atenção, meta atrasada |
| `--fs-info` | `#8FB3D9` | Informações neutras |

As cores semânticas aparecem **apenas** quando há informação a transmitir.
Nenhum cartão recebe uma cor decorativa própria.

### Marca

O símbolo é um vetor SVG original (`frontend/src/assets/finansight-mark.svg`):
uma lente aberta com uma tendência ascendente e um ponto focal — a combinação
de *visão* e *crescimento*. Ele funciona ao lado do nome, isolado no menu, no
favicon e nas telas de carregamento.

### Tipografia

Inter, com pesos 400/500/600/700. Valores monetários usam numerais tabulares
(`font-variant-numeric: tabular-nums`) para alinhar colunas, e são formatados
no padrão brasileiro (`R$ 8.450,32`).

### Design system

- Tokens SCSS globais em `frontend/src/styles/_tokens.scss`.
- Preset PrimeNG "Midnight" em `frontend/src/styles/midnight-theme.ts`, que
  reescreve tokens semânticos (superfícies, textos, campos, overlays) e as
  seções de cada componente — botões, inputs, selects, tabelas, diálogos,
  toasts, paginador, barras de progresso, calendário, menus e tooltips.
- Componentes reutilizáveis: `fs-stat-card`, `fs-trend-indicator`,
  `fs-progress-meter`, `fs-empty-state`, `fs-page-header`, `fs-finance-chart`,
  `fs-period-selector`, `fs-confirm-dialog`, `fs-auth-layout` e `fs-brand-logo`.

## Regras de negócio

Documentadas também no código (`AnalyticsService`, `BudgetRules`, `GoalService`):

| Regra | Definição |
| --- | --- |
| Saldo atual | Soma de **todas** as receitas menos **todas** as despesas com data até o fim do período selecionado (saldo acumulado). |
| Receitas / despesas do período | Somente transações com data dentro do intervalo selecionado. |
| Economia do período | Receitas do período − despesas do período. |
| Comparação | Período anterior de mesma duração; sem dados, a variação é omitida. |
| Gasto do orçamento | Despesas da categoria dentro do mês do orçamento. |
| Situação do orçamento | `EM_DIA` (< 70%), `ATENCAO` (70%–100%), `EXCEDIDO` (> 100%). |
| Valor restante | Nunca negativo (limitado a zero). |
| Progresso da meta | `acumulado ÷ desejado × 100`, com 2 casas decimais. |
| Meta concluída | O acumulado atinge ou ultrapassa o valor desejado. |
| Meta atrasada | Prazo anterior a hoje e meta ainda ativa. |
| Valor acumulado da meta | Soma das contribuições registradas (fonte: banco). |

Valores monetários usam `BigDecimal` com escala 2 no Java e `number` no
TypeScript — nunca `float`/`double`.

## Estrutura do projeto

```
finansight/
├── backend/                    # API Java / Spring Boot
│   ├── src/main/java/com/finansight/
│   │   ├── config/             # segurança, tema OpenAPI, seed de demonstração
│   │   ├── controller/         # controllers REST
│   │   ├── domain/             # entidades e enums
│   │   ├── dto/                # contratos de entrada e saída
│   │   ├── exception/          # tratamento centralizado de erros
│   │   ├── repository/         # Spring Data JPA
│   │   ├── security/           # JWT, filtros e resolução do usuário
│   │   ├── service/            # regras de negócio
│   │   └── support/            # utilitários (período)
│   ├── src/main/resources/
│   │   ├── db/migration/       # migrações Flyway
│   │   └── application.yml
│   └── src/test/               # JUnit + Mockito
├── frontend/                   # SPA Angular
│   ├── src/app/
│   │   ├── core/               # modelos, serviços HTTP, interceptador, guard
│   │   ├── layout/             # shell, menu lateral, cabeçalho
│   │   ├── shared/             # design system reutilizável
│   │   ├── features/           # telas (auth, dashboard, transações, ...)
│   │   └── styles/             # tokens SCSS e preset PrimeNG
│   └── proxy.conf.js           # proxy /api para o back-end
├── docs/                       # imagens e notas de arquitetura
├── .env.example
├── .gitignore
└── README.md
```

## Requisitos

- **Java 21+** (JDK 21, 22, 23 ou 24 — o projeto compila com `--release 21`).
- **Maven 3.9+** ou o wrapper (`mvnw`) incluído no projeto.
- **Node.js 20.19+ / 22.12+ / 24+** e npm 10+.
- **PostgreSQL 14+** rodando localmente (sem Docker obrigatório).
- Navegador moderno (Chrome, Edge, Firefox ou Safari recentes).

## Configuração de ambiente

### 1. Banco de dados

```bash
# cria o papel e o banco (ajuste a senha conforme sua instalação)
psql -U postgres -c "CREATE USER finansight WITH PASSWORD 'finansight';"
psql -U postgres -c "CREATE DATABASE finansight OWNER finansight;"
```

As migrações do Flyway são aplicadas automaticamente na inicialização da API.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores. No Windows PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/finansight"
$env:DB_USER="finansight"
$env:DB_PASSWORD="finansight"
$env:FINANSIGHT_JWT_SECRET="um-segredo-longo-e-aleatorio-por-favor-troque-este"
$env:FINANSIGHT_DEMO_ENABLED="true"
```

> Em produção, use sempre um segredo forte e mantenha
> `FINANSIGHT_DEMO_ENABLED=false`.

## Executando o sistema

### Back-end

```bash
cd backend
mvn spring-boot:run
# ou
mvn clean package && java -jar target/finansight-backend-1.0.0.jar
```

- API: <http://localhost:8080>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- Health check: <http://localhost:8080/actuator/health>

### Front-end

```bash
cd frontend
npm install
npm start
```

- Aplicação: <http://localhost:4200>

O servidor de desenvolvimento encaminha as chamadas de `/api` para o back-end
(via `proxy.conf.js`). Para apontar para outro endereço:

```bash
PROXY_TARGET=http://localhost:8080 npm start
```

### Conta de demonstração

Com `FINANSIGHT_DEMO_ENABLED=true`, o seed cria uma conta isolada, com
histórico de 6 meses, categorias, orçamentos e metas:

| E-mail | Senha |
| --- | --- |
| `demo@finansight.app` | `demo1234` |

> Esses dados são de **demonstração** e ficam separados dos dados de qualquer
> conta real. Para começar do zero, cadastre-se pela tela de criação de conta.

## Testes

### Back-end

```bash
cd backend
mvn test
```

25 testes automatizados cobrindo as regras mais importantes:

| Classe | O que garante |
| --- | --- |
| `BudgetRulesTest` | Faixas de atenção/excedido, percentual e valor restante. |
| `AnalyticsServiceTest` | Saldo acumulado, economia do período, comparação e distribuição. |
| `TransactionServiceTest` | Compatibilidade tipo × categoria, categoria inativa, normalização de valores e isolamento entre usuários. |
| `GoalServiceTest` | Contribuições, conclusão automática, prazo inválido e meta atrasada. |
| `AuthServiceTest` | Hash da senha, e-mail duplicado e ausência de senha na resposta. |
| `PeriodResolverTest` | Padrões e correção de período. |
| `FinanSightApplicationTests` | Carregamento do contexto (segurança, JPA, OpenAPI). |

### Front-end

```bash
cd frontend
npm run build   # verificação de tipagem e bundle de produção
```

## Documentação da API

A documentação OpenAPI 3.1 é gerada automaticamente pelo Springdoc:

- **Swagger UI:** <http://localhost:8080/swagger-ui.html>
- **JSON:** <http://localhost:8080/v3/api-docs>

| Recurso | Descrição |
| --- | --- |
| `POST /api/auth/register` | Cadastro (devolve token) |
| `POST /api/auth/login` | Login (devolve token) |
| `GET /api/auth/me` | Perfil do usuário autenticado |
| `PUT /api/auth/profile` | Atualização de perfil |
| `PUT /api/auth/password` | Troca de senha |
| `GET/POST/PUT/DELETE /api/categories` | Categorias |
| `GET/POST/PUT/DELETE /api/transactions` | Transações (paginação, filtros, ordenação) |
| `GET/POST/PUT/DELETE /api/budgets` | Orçamentos |
| `GET/POST/PUT/DELETE /api/goals` | Metas financeiras |
| `GET/POST/DELETE /api/goals/{id}/contributions` | Contribuições das metas |
| `GET /api/dashboard` | Indicadores consolidados do período |
| `GET /api/reports` | Relatório analítico do período |
| `GET /api/reports/export` | Exportação CSV |

## Capturas de tela

As imagens das telas estão em [`docs/`](docs/):

| Tela | Arquivo |
| --- | --- |
| Login | `docs/01-login.png` |
| Cadastro | `docs/02-cadastro.png` |
| Dashboard | `docs/03-dashboard.png` |
| Transações | `docs/04-transacoes.png` |
| Categorias | `docs/05-categorias.png` |
| Orçamentos | `docs/06-orcamentos.png` |
| Metas financeiras | `docs/07-metas.png` |
| Relatórios | `docs/08-relatorios.png` |
| Configurações | `docs/09-configuracoes.png` |
| Layout mobile | `docs/10-mobile-dashboard.png` |
| Diálogo de nova transação | `docs/11-dialog-transacao.png` |
| Menu lateral recolhido | `docs/12-sidebar-recolhido.png` |

> As notas técnicas de arquitetura estão em [`docs/arquitetura.md`](docs/arquitetura.md).

## Segurança

- Senhas com hash **BCrypt** (custo 12) — nunca em texto puro, nunca devolvidas
  pela API.
- Tokens **JWT HS256** com expiração; o segredo vem de variável de ambiente.
- **Stateless**: o back-end não guarda sessão em memória.
- Autorização verificada no servidor em **todas** as requisições: cada consulta
  é filtrada por `user_id`, e um usuário não consegue ler nem alterar dados de
  outro (verificado com dois usuários reais no banco).
- Validação de entrada com Bean Validation e tratamento centralizado de
  erros (respostas JSON padronizadas).
- CORS restrito às origens configuradas.
- Segredos fora do código: `.env` está no `.gitignore` e há um `.env.example`.

## Decisões técnicas

- **PrimeNG 21 em vez do 22.** A versão 22 exige uma licença PrimeUI paga e
  exibe um aviso de "Invalid PrimeUI License" na tela. A versão 21 é a última
  sem licenciamento e mantém a mesma API de componentes — o projeto pode ser
  atualizado para o 22 adicionando apenas a chave `license` em
  `providePrimeNG`.
- **Chart.js diretamente** (em vez do wrapper `p-chart`) para controlar
  linhas, grades, tooltips e a legenda em HTML do gráfico de rosca.
- **Consultas agregadas no banco** (`SUM`, `GROUP BY`, `EXTRACT`) para o
  dashboard e os relatórios — o front-end nunca recalcula indicador.
- **Especificações JPA** na listagem de transações para combinar busca, tipo,
  categoria, período e ordenação em uma única consulta.
- **Token em `localStorage`**, com interceptor HTTP injetando o cabeçalho
  `Authorization` e devendo o usuário ao login em caso de 401.

## Funcionalidades incompletas ou limitações

- **Recuperação de senha por e-mail** não foi implementada (exige um serviço
  de e-mail transacional). A troca de senha autenticada está disponível.
- **Gráfico de pizza com muitas categorias**: o doughnut exibe as fatias sem
  rótulo interno; os valores e percentuais ficam na legenda ao lado, que
  permanece legível em todas as larguras.
- **O seed de demonstração** recria os dados apenas se a conta de demonstração
  ainda não existir. Para recriá-los, remova o usuário `demo@finansight.app`.
- **Sem multiusuário por Household**: cada usuário tem uma base isolada e
  independente.
- **Paginação da tabela de transações é server-side**; a ordenação disponível
  cobre data, descrição, categoria e valor.

## Licença

Projeto acadêmico/portfólio, distribuído sob a licença MIT.
