package com.finansight.repository;

import com.finansight.domain.GoalContribution;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GoalContributionRepository extends JpaRepository<GoalContribution, Long> {

    List<GoalContribution> findAllByGoalIdAndUserIdOrderByDateDescIdDesc(Long goalId, Long userId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM GoalContribution c WHERE c.goal.id = :goalId")
    java.math.BigDecimal sumByGoalId(@Param("goalId") Long goalId);
}
