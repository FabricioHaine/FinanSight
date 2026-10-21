package com.finansight.dto;

import java.time.LocalDate;
import java.util.List;

/** Resposta completa do dashboard financeiro. */
public record DashboardResponse(
        SummaryResponse summary,
        List<CashflowPoint> cashflow,
        List<CategorySlice> categoryDistribution,
        List<TransactionResponse> recentTransactions,
        List<GoalResponse> goals,
        List<BudgetResponse> budgets,
        LocalDate from,
        LocalDate to) {}
