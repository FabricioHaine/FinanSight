package com.finansight.repository;

import com.finansight.domain.Budget;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findAllByUserIdOrderByPeriodDescLimitAmountAsc(Long userId);

    List<Budget> findAllByUserIdAndPeriod(Long userId, LocalDate period);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    Optional<Budget> findByUserIdAndCategoryIdAndPeriod(Long userId, Long categoryId, LocalDate period);

    List<Budget> findAllByUserIdAndPeriodBetween(Long userId, LocalDate from, LocalDate to);
}
