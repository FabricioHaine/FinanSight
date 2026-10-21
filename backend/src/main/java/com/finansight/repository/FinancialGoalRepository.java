package com.finansight.repository;

import com.finansight.domain.FinancialGoal;
import com.finansight.domain.enums.GoalStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {

    List<FinancialGoal> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<FinancialGoal> findAllByUserIdAndStatusOrderByCreatedAtDesc(Long userId, GoalStatus status);

    Optional<FinancialGoal> findByIdAndUserId(Long id, Long userId);
}
