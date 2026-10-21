package com.finansight.dto;

import java.math.BigDecimal;

/**
 * Indicadores principais do dashboard.
 *
 * <p>Regras de negócio:
 *
 * <ul>
 *   <li><b>saldoAtual</b>: soma de receitas menos despesas de <b>todas</b> as transações do usuário com data até o fim do período - e o saldo acumulado, não do período.</li>
 *   <li><b>receitas / despesas / economia</b>: totalizados apenas dentro do período selecionado.</li>
 *   <li><b>economia</b>: receitas do período menos despesas do período.</li>
 *   <li>As variacoes comparam com o período imediatamente anterior de mesma duracao.</li>
 * </ul>
 */
public record SummaryResponse(
        BigDecimal balance,
        BigDecimal revenues,
        BigDecimal expenses,
        BigDecimal savings,
        BigDecimal balanceVariation,
        BigDecimal revenuesVariation,
        BigDecimal expensesVariation,
        BigDecimal savingsVariation,
        boolean comparisonAvailable) {}
