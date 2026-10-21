package com.finansight.service;

import com.finansight.domain.Budget;
import com.finansight.domain.Category;
import com.finansight.domain.enums.BudgetStatus;
import com.finansight.domain.enums.CategoryType;
import com.finansight.dto.BudgetRequest;
import com.finansight.dto.BudgetResponse;
import com.finansight.config.BudgetRules;
import com.finansight.exception.BusinessRuleException;
import com.finansight.exception.ResourceNotFoundException;
import com.finansight.repository.BudgetRepository;
import com.finansight.repository.CategoryRepository;
import com.finansight.repository.TransactionRepository;
import com.finansight.security.CurrentUserProvider;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserProvider currentUserProvider;
    private final BudgetRules budgetRules;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository,
            CurrentUserProvider currentUserProvider,
            BudgetRules budgetRules) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserProvider = currentUserProvider;
        this.budgetRules = budgetRules;
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> list(LocalDate from, LocalDate to) {
        Long userId = currentUserProvider.getCurrentUserId();
        LocalDate start = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate end = to == null ? start.withDayOfMonth(start.lengthOfMonth()) : to;
        List<Budget> budgets = budgetRepository.findAllByUserIdAndPeriodBetween(userId, start, end);
        return budgets.stream().map(this::toResponse).toList();
    }

    @Transactional
    public BudgetResponse create(BudgetRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        Category category = requireCategory(request.categoryId(), userId);
        if (category.getType() != CategoryType.DESPESA) {
            throw new BusinessRuleException(
                    "Orçamentos só podem ser aplicados a categorias de despesa.");
        }
        LocalDate period = normalizePeriod(request.period());
        if (budgetRepository.findByUserIdAndCategoryIdAndPeriod(userId, category.getId(), period).isPresent()) {
            throw new BusinessRuleException("Já existe um orçamento para esta categoria no período.");
        }

        Budget budget = new Budget();
        budget.setUser(currentUserProvider.getCurrentUser());
        budget.setCategory(category);
        budget.setLimitAmount(request.limitAmount().setScale(2, java.math.RoundingMode.HALF_UP));
        budget.setPeriod(period);
        budgetRepository.save(budget);
        return toResponse(budget);
    }

    @Transactional
    public BudgetResponse update(Long id, BudgetRequest request) {
        Budget budget = requireBudget(id);
        Long userId = currentUserProvider.getCurrentUserId();
        Category category = requireCategory(request.categoryId(), userId);
        if (category.getType() != CategoryType.DESPESA) {
            throw new BusinessRuleException(
                    "Orçamentos só podem ser aplicados a categorias de despesa.");
        }
        LocalDate period = normalizePeriod(request.period());
        budgetRepository
                .findByUserIdAndCategoryIdAndPeriod(userId, category.getId(), period)
                .filter(existing -> !existing.getId().equals(budget.getId()))
                .ifPresent(existing -> {
                    throw new BusinessRuleException(
                            "Já existe um orçamento para esta categoria no período.");
                });

        budget.setCategory(category);
        budget.setLimitAmount(request.limitAmount().setScale(2, java.math.RoundingMode.HALF_UP));
        budget.setPeriod(period);
        budgetRepository.save(budget);
        return toResponse(budget);
    }

    @Transactional
    public void delete(Long id) {
        budgetRepository.delete(requireBudget(id));
    }

    /** Normaliza o período para o primeiro dia do mês informado. */
    private LocalDate normalizePeriod(LocalDate period) {
        return period.withDayOfMonth(1);
    }

    private Category requireCategory(Long categoryId, Long userId) {
        return categoryRepository
                .findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }

    private Budget requireBudget(Long id) {
        Long userId = currentUserProvider.getCurrentUserId();
        return budgetRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado"));
    }

    private BudgetResponse toResponse(Budget budget) {
        Long userId = budget.getUser().getId();
        LocalDate period = budget.getPeriod();
        LocalDate monthStart = period.withDayOfMonth(1);
        LocalDate monthEnd = period.withDayOfMonth(period.lengthOfMonth());

        BigDecimal spent =
                transactionRepository.sumExpensesByCategoryInPeriod(
                        userId, budget.getCategory().getId(), monthStart, monthEnd);
        BigDecimal limit = budget.getLimitAmount();
        BigDecimal remaining = budgetRules.remaining(limit, spent);
        BigDecimal percent = budgetRules.percentUsed(limit, spent);
        BudgetStatus status = budgetRules.status(limit, spent);

        return new BudgetResponse(
                budget.getId(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                limit,
                spent,
                remaining,
                percent,
                status,
                period);
    }
}
