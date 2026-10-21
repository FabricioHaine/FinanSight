package com.finansight.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Ponto da serie de evolução de receitas e despesas. */
public record CashflowPoint(
        String label,
        LocalDate reference,
        BigDecimal revenues,
        BigDecimal expenses,
        BigDecimal balance) {}
