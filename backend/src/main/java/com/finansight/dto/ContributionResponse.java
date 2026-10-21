package com.finansight.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ContributionResponse(
        Long id,
        Long goalId,
        String goalName,
        BigDecimal amount,
        LocalDate date,
        String note,
        Instant createdAt) {}
