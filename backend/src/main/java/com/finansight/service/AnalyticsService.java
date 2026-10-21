package com.finansight.service;

import com.finansight.domain.enums.TransactionType;
import com.finansight.dto.CashflowPoint;
import com.finansight.dto.CategorySlice;
import com.finansight.dto.PeriodComparison;
import com.finansight.dto.SummaryResponse;
import com.finansight.dto.TransactionResponse;
import com.finansight.repository.TransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Calculos financeiros do dashboard e dos relatórios.
 *
 * <p>Regra de saldo: o <b>saldo atual</b> soma todas as receitas e subtrai
 * todas as despesas do usuário com data até o fim do período selecionado.
 * As receitas, despesas e economia do período consideram apenas as transações
 * dentro do intervalo escolhido.
 */
@Service
public class AnalyticsService {

    private static final DateTimeFormatter MONTH_LABEL =
            DateTimeFormatter.ofPattern("MMM/yy", new Locale("pt", "BR"));
    private static final DateTimeFormatter DAY_LABEL =
            DateTimeFormatter.ofPattern("dd/MM", new Locale("pt", "BR"));

    private final TransactionRepository transactionRepository;

    public AnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public SummaryResponse summary(Long userId, LocalDate from, LocalDate to, Long categoryId) {
        BigDecimal revenues =
                zero(
                        transactionRepository.sumByTypeInPeriod(
                                userId, TransactionType.RECEITA, from, to, categoryId));
        BigDecimal expenses =
                zero(
                        transactionRepository.sumByTypeInPeriod(
                                userId, TransactionType.DESPESA, from, to, categoryId));
        BigDecimal savings = revenues.subtract(expenses);
        BigDecimal balance = zero(transactionRepository.sumBalanceUntil(userId, to, categoryId));

        LocalDate previousTo = from.minusDays(1);
        long days = java.time.temporal.ChronoUnit.DAYS.between(from, to);
        LocalDate previousFrom = previousTo.minusDays(Math.max(days, 0));

        BigDecimal previousRevenues =
                zero(
                        transactionRepository.sumByTypeInPeriod(
                                userId, TransactionType.RECEITA, previousFrom, previousTo, categoryId));
        BigDecimal previousExpenses =
                zero(
                        transactionRepository.sumByTypeInPeriod(
                                userId, TransactionType.DESPESA, previousFrom, previousTo, categoryId));
        BigDecimal previousBalance =
                zero(transactionRepository.sumBalanceUntil(userId, previousTo, categoryId));
        BigDecimal previousSavings = previousRevenues.subtract(previousExpenses);

        boolean comparisonAvailable =
                previousRevenues.compareTo(BigDecimal.ZERO) > 0
                        || previousExpenses.compareTo(BigDecimal.ZERO) > 0;

        return new SummaryResponse(
                balance,
                revenues,
                expenses,
                savings,
                TransactionService.variation(balance, previousBalance),
                TransactionService.variation(revenues, previousRevenues),
                TransactionService.variation(expenses, previousExpenses),
                TransactionService.variation(savings, previousSavings),
                comparisonAvailable);
    }

    @Transactional(readOnly = true)
    public PeriodComparison comparison(Long userId, LocalDate from, LocalDate to, Long categoryId) {
        SummaryResponse current = summary(userId, from, to, categoryId);
        LocalDate previousTo = from.minusDays(1);
        long days = java.time.temporal.ChronoUnit.DAYS.between(from, to);
        LocalDate previousFrom = previousTo.minusDays(Math.max(days, 0));
        SummaryResponse previous = summary(userId, previousFrom, previousTo, categoryId);

        return new PeriodComparison(
                current.revenues(),
                current.expenses(),
                current.savings(),
                previous.revenues(),
                previous.expenses(),
                previous.savings(),
                current.revenuesVariation(),
                current.expensesVariation(),
                current.savingsVariation());
    }

    /**
     * Serie de evolução. Períodos de até 31 dias são agrupados por dia;
     * períodos maiores, por mês - o que mantem o gráfico legivel.
     */
    @Transactional(readOnly = true)
    public List<CashflowPoint> cashflow(
            Long userId, LocalDate from, LocalDate to, Long categoryId) {
        long days = java.time.temporal.ChronoUnit.DAYS.between(from, to);
        boolean daily = days <= 31;

        Map<String, BigDecimal> revenues = new LinkedHashMap<>();
        Map<String, BigDecimal> expenses = new LinkedHashMap<>();
        Map<String, LocalDate> references = new LinkedHashMap<>();

        if (daily) {
            for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
                String key = date.format(DAY_LABEL);
                references.put(key, date);
                revenues.put(key, BigDecimal.ZERO);
                expenses.put(key, BigDecimal.ZERO);
            }
            for (Object[] row :
                    transactionRepository.dailyEvolution(userId, from, to, categoryId)) {
                LocalDate date = (LocalDate) row[0];
                TransactionType type = (TransactionType) row[1];
                BigDecimal amount = (BigDecimal) row[2];
                String key = date.format(DAY_LABEL);
                if (type == TransactionType.RECEITA) {
                    revenues.merge(key, amount, BigDecimal::add);
                } else {
                    expenses.merge(key, amount, BigDecimal::add);
                }
            }
        } else {
            YearMonth start = YearMonth.from(from);
            YearMonth end = YearMonth.from(to);
            for (YearMonth month = start; !month.isAfter(end); month = month.plusMonths(1)) {
                String key = month.format(MONTH_LABEL);
                references.put(key, month.atDay(1));
                revenues.put(key, BigDecimal.ZERO);
                expenses.put(key, BigDecimal.ZERO);
            }
            for (Object[] row :
                    transactionRepository.monthlyEvolution(userId, from, to, categoryId)) {
                int year = ((Number) row[0]).intValue();
                int month = ((Number) row[1]).intValue();
                TransactionType type = (TransactionType) row[2];
                BigDecimal amount = (BigDecimal) row[3];
                String key = YearMonth.of(year, month).format(MONTH_LABEL);
                if (type == TransactionType.RECEITA) {
                    revenues.merge(key, amount, BigDecimal::add);
                } else {
                    expenses.merge(key, amount, BigDecimal::add);
                }
            }
        }

        List<CashflowPoint> points = new ArrayList<>();
        for (Map.Entry<String, LocalDate> entry : references.entrySet()) {
            BigDecimal revenue = zero(revenues.get(entry.getKey()));
            BigDecimal expense = zero(expenses.get(entry.getKey()));
            points.add(
                    new CashflowPoint(
                            entry.getKey(),
                            entry.getValue(),
                            revenue,
                            expense,
                            revenue.subtract(expense)));
        }
        return points;
    }

    /** Serie mensal usada nos relatórios, independentemente da duracao do período. */
    @Transactional(readOnly = true)
    public List<CashflowPoint> monthlyCashflow(
            Long userId, LocalDate from, LocalDate to, Long categoryId) {
        Map<String, BigDecimal> revenues = new LinkedHashMap<>();
        Map<String, BigDecimal> expenses = new LinkedHashMap<>();
        Map<String, LocalDate> references = new LinkedHashMap<>();

        YearMonth start = YearMonth.from(from);
        YearMonth end = YearMonth.from(to);
        for (YearMonth month = start; !month.isAfter(end); month = month.plusMonths(1)) {
            String key = month.format(MONTH_LABEL);
            references.put(key, month.atDay(1));
            revenues.put(key, BigDecimal.ZERO);
            expenses.put(key, BigDecimal.ZERO);
        }
        for (Object[] row : transactionRepository.monthlyEvolution(userId, from, to, categoryId)) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            TransactionType type = (TransactionType) row[2];
            BigDecimal amount = (BigDecimal) row[3];
            String key = YearMonth.of(year, month).format(MONTH_LABEL);
            if (type == TransactionType.RECEITA) {
                revenues.merge(key, amount, BigDecimal::add);
            } else {
                expenses.merge(key, amount, BigDecimal::add);
            }
        }

        List<CashflowPoint> points = new ArrayList<>();
        for (Map.Entry<String, LocalDate> entry : references.entrySet()) {
            BigDecimal revenue = zero(revenues.get(entry.getKey()));
            BigDecimal expense = zero(expenses.get(entry.getKey()));
            points.add(
                    new CashflowPoint(
                            entry.getKey(),
                            entry.getValue(),
                            revenue,
                            expense,
                            revenue.subtract(expense)));
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<CategorySlice> categoryDistribution(
            Long userId, LocalDate from, LocalDate to, Long categoryId) {
        List<Object[]> rows =
                transactionRepository.sumExpensesGroupedByCategory(userId, from, to, categoryId);
        BigDecimal total =
                rows.stream()
                        .map(row -> (BigDecimal) row[2])
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySlice> slices = new ArrayList<>();
        for (Object[] row : rows) {
            Long sliceCategoryId = (Long) row[0];
            String name = (String) row[1];
            BigDecimal amount = (BigDecimal) row[2];
            BigDecimal percent =
                    total.compareTo(BigDecimal.ZERO) == 0
                            ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                            : amount.multiply(BigDecimal.valueOf(100))
                                    .divide(total, 2, RoundingMode.HALF_UP);
            slices.add(new CategorySlice(sliceCategoryId, name, amount, percent));
        }
        return slices;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> recentTransactions(Long userId, int limit) {
        return transactionRepository.findAllByUserIdOrderByDateDescIdDesc(userId).stream()
                .limit(limit)
                .map(TransactionService::toStaticResponse)
                .toList();
    }

    private BigDecimal zero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : value;
    }
}
