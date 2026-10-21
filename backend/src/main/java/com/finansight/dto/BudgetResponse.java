package com.finansight.dto;

import com.finansight.domain.enums.BudgetStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetResponse(
        Long id,
        Long categoryId,
        String categoryName,
        BigDecimal limitAmount,
        BigDecimal spentAmount,
        BigDecimal remainingAmount,
        BigDecimal percentUsed,
        BudgetStatus status,
        LocalDate period) {}
