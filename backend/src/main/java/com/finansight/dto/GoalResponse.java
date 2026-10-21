package com.finansight.dto;

import com.finansight.domain.enums.GoalStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record GoalResponse(
        Long id,
        String name,
        BigDecimal targetAmount,
        BigDecimal accumulatedAmount,
        BigDecimal remainingAmount,
        BigDecimal percentComplete,
        GoalStatus status,
        boolean overdue,
        LocalDate startDate,
        LocalDate deadline,
        String description,
        Instant createdAt) {}
