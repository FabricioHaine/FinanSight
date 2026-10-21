package com.finansight.dto;

import com.finansight.domain.enums.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        String description,
        BigDecimal amount,
        TransactionType type,
        Long categoryId,
        String categoryName,
        LocalDate date,
        String notes,
        Instant createdAt) {}
