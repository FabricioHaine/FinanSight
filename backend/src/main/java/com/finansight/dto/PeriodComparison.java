package com.finansight.dto;

import java.math.BigDecimal;

/** Comparação entre o período atual e o período anterior. */
public record PeriodComparison(
        BigDecimal currentRevenues,
        BigDecimal currentExpenses,
        BigDecimal currentBalance,
        BigDecimal previousRevenues,
        BigDecimal previousExpenses,
        BigDecimal previousBalance,
        BigDecimal revenuesVariation,
        BigDecimal expensesVariation,
        BigDecimal balanceVariation) {}
