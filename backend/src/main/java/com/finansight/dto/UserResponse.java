package com.finansight.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record UserResponse(
        Long id,
        String name,
        String email,
        String currency,
        BigDecimal monthlyIncome,
        String savingsGoal,
        Instant createdAt) {

    public static UserResponse from(com.finansight.domain.User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCurrency(),
                user.getMonthlyIncome(),
                user.getSavingsGoal(),
                user.getCreatedAt());
    }
}
