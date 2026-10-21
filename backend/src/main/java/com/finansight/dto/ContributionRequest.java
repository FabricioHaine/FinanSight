package com.finansight.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ContributionRequest(
        @NotNull(message = "Informe o valor da contribuição")
                @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
                @Digits(integer = 17, fraction = 2, message = "O valor deve ter no maximo 2 casas decimais")
                BigDecimal amount,
        LocalDate date,
        @Size(max = 240, message = "A observação deve ter no maximo 240 caracteres") String note) {}
