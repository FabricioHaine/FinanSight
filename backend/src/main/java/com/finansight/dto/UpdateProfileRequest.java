package com.finansight.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateProfileRequest(
        @NotBlank(message = "Informe seu nome")
                @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres")
                String name,
        @DecimalMin(value = "0.00", message = "A renda mensal não pode ser negativa")
                BigDecimal monthlyIncome,
        @Size(max = 240, message = "A meta mensal deve ter no maximo 240 caracteres")
                String savingsGoal) {}
