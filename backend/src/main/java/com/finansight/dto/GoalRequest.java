package com.finansight.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @NotBlank(message = "Informe o nome da meta")
                @Size(max = 120, message = "O nome deve ter no maximo 120 caracteres")
                String name,
        @NotNull(message = "Informe o valor desejado")
                @DecimalMin(value = "0.01", message = "O valor desejado deve ser maior que zero")
                @Digits(integer = 17, fraction = 2, message = "O valor deve ter no maximo 2 casas decimais")
                BigDecimal targetAmount,
        LocalDate startDate,
        LocalDate deadline,
        @Size(max = 500, message = "A descrição deve ter no maximo 500 caracteres") String description) {}
