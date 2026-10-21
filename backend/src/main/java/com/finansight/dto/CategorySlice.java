package com.finansight.dto;

import java.math.BigDecimal;

/** Fatia da distribuição de despesas por categoria. */
public record CategorySlice(
        Long categoryId, String categoryName, BigDecimal amount, BigDecimal percent) {}
