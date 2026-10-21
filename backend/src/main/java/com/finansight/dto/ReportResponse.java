package com.finansight.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Relatório de análise financeira do período selecionado. */
public record ReportResponse(
        SummaryResponse summary,
        PeriodComparison comparison,
        List<CashflowPoint> monthlyEvolution,
        List<CategorySlice> categoryDistribution,
        BigDecimal averageMonthlyExpenses,
        BigDecimal averageMonthlyRevenues,
        LocalDate from,
        LocalDate to) {}
