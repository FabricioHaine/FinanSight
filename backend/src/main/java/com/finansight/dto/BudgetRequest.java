package com.finansight.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetRequest(
        @NotNull(message = "Selecione a categoria") Long categoryId,
        @NotNull(message = "Informe o limite")
                @DecimalMin(value = "0.01", message = "O limite deve ser maior que zero")
                @Digits(integer = 17, fraction = 2, message = "O limite deve ter no maximo 2 casas decimais")
                BigDecimal limitAmount,
        @NotNull(message = "Informe o período") LocalDate period) {}
