package com.finansight.dto;

import com.finansight.domain.enums.CategoryType;

public record CategoryResponse(
        Long id,
        String name,
        CategoryType type,
        String description,
        boolean active,
        long transactionCount) {}
