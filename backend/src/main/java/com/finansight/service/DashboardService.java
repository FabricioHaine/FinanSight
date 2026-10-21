package com.finansight.service;

import com.finansight.dto.DashboardResponse;
import com.finansight.dto.GoalResponse;
import com.finansight.dto.BudgetResponse;
import com.finansight.dto.TransactionResponse;
import com.finansight.security.CurrentUserProvider;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final AnalyticsService analyticsService;
    private final GoalService goalService;
    private final BudgetService budgetService;
    private final CurrentUserProvider currentUserProvider;

    public DashboardService(
            AnalyticsService analyticsService,
            GoalService goalService,
            BudgetService budgetService,
            CurrentUserProvider currentUserProvider) {
        this.analyticsService = analyticsService;
        this.goalService = goalService;
        this.budgetService = budgetService;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public DashboardResponse build(LocalDate from, LocalDate to) {
        Long userId = currentUserProvider.getCurrentUserId();
        return new DashboardResponse(
                analyticsService.summary(userId, from, to, null),
                analyticsService.cashflow(userId, from, to, null),
                analyticsService.categoryDistribution(userId, from, to, null),
                analyticsService.recentTransactions(userId, 8),
                goalService.list(null),
                budgetService.list(currentMonthRange(from)[0], currentMonthRange(from)[1]),
                from,
                to);
    }

    private LocalDate[] currentMonthRange(LocalDate reference) {
        LocalDate base = reference == null ? LocalDate.now() : reference;
        LocalDate start = base.withDayOfMonth(1);
        return new LocalDate[] {start, start.withDayOfMonth(start.lengthOfMonth())};
    }

    /** Metas ativas em destaque (as concluídas ficam de fora do painel). */
    public List<GoalResponse> activeGoals() {
        return goalService.list(com.finansight.domain.enums.GoalStatus.ATIVA);
    }

    /** Orçamentos do mês corrente. */
    public List<BudgetResponse> currentBudgets() {
        LocalDate[] range = currentMonthRange(LocalDate.now());
        return budgetService.list(range[0], range[1]);
    }

    /** Transações recentes do usuário. */
    public List<TransactionResponse> recentTransactions(int limit) {
        return analyticsService.recentTransactions(currentUserProvider.getCurrentUserId(), limit);
    }
}
