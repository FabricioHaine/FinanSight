package com.finansight.repository;

import com.finansight.domain.FinancialTransaction;
import com.finansight.domain.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository
        extends JpaRepository<FinancialTransaction, Long>, JpaSpecificationExecutor<FinancialTransaction> {

    List<FinancialTransaction> findAllByUserIdOrderByDateDescIdDesc(Long userId);

    Optional<FinancialTransaction> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByCategoryIdAndUserId(Long categoryId, Long userId);

    @Query(
            """
            SELECT COALESCE(SUM(t.amount), 0)
            FROM FinancialTransaction t
            WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :from AND :to
              AND (:categoryId IS NULL OR t.category.id = :categoryId)
            """)
    BigDecimal sumByTypeInPeriod(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("categoryId") Long categoryId);

    /**
     * Saldo acumulado: soma de receitas menos despesas de todas as transações
     * com data até {@code to} (inclusive).
     */
    @Query(
            """
            SELECT COALESCE(SUM(CASE WHEN t.type = com.finansight.domain.enums.TransactionType.RECEITA
                                   THEN t.amount ELSE -t.amount END), 0)
            FROM FinancialTransaction t
            WHERE t.user.id = :userId AND t.date <= :to
              AND (:categoryId IS NULL OR t.category.id = :categoryId)
            """)
    BigDecimal sumBalanceUntil(
            @Param("userId") Long userId, @Param("to") LocalDate to, @Param("categoryId") Long categoryId);

    @Query(
            """
            SELECT COALESCE(SUM(t.amount), 0)
            FROM FinancialTransaction t
            WHERE t.user.id = :userId
              AND t.type = com.finansight.domain.enums.TransactionType.DESPESA
              AND t.category.id = :categoryId
              AND t.date BETWEEN :from AND :to
            """)
    BigDecimal sumExpensesByCategoryInPeriod(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    /** Distribuição de despesas por categoria no período. */
    @Query(
            """
            SELECT t.category.id, t.category.name, SUM(t.amount)
            FROM FinancialTransaction t
            WHERE t.user.id = :userId
              AND t.type = com.finansight.domain.enums.TransactionType.DESPESA
              AND t.date BETWEEN :from AND :to
              AND (:categoryId IS NULL OR t.category.id = :categoryId)
            GROUP BY t.category.id, t.category.name
            ORDER BY SUM(t.amount) DESC
            """)
    List<Object[]> sumExpensesGroupedByCategory(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("categoryId") Long categoryId);

    /** Evolução diaria: data, tipo e total dentro do período. */
    @Query(
            """
            SELECT t.date, t.type, SUM(t.amount)
            FROM FinancialTransaction t
            WHERE t.user.id = :userId AND t.date BETWEEN :from AND :to
              AND (:categoryId IS NULL OR t.category.id = :categoryId)
            GROUP BY t.date, t.type
            ORDER BY t.date
            """)
    List<Object[]> dailyEvolution(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("categoryId") Long categoryId);

    /** Evolução mensal: ano, mês, tipo e total dentro do período. */
    @Query(
            """
            SELECT EXTRACT(YEAR FROM t.date), EXTRACT(MONTH FROM t.date), t.type, SUM(t.amount)
            FROM FinancialTransaction t
            WHERE t.user.id = :userId AND t.date BETWEEN :from AND :to
              AND (:categoryId IS NULL OR t.category.id = :categoryId)
            GROUP BY EXTRACT(YEAR FROM t.date), EXTRACT(MONTH FROM t.date), t.type
            ORDER BY EXTRACT(YEAR FROM t.date), EXTRACT(MONTH FROM t.date)
            """)
    List<Object[]> monthlyEvolution(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("categoryId") Long categoryId);
}
