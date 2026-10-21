package com.finansight.dto;

import com.finansight.domain.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotBlank(message = "Informe a descrição")
                @Size(max = 160, message = "A descrição deve ter no maximo 160 caracteres")
                String description,
        @NotNull(message = "Informe o valor")
                @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
                @Digits(integer = 17, fraction = 2, message = "O valor deve ter no maximo 2 casas decimais")
                BigDecimal amount,
        @NotNull(message = "Selecione o tipo da transação") TransactionType type,
        @NotNull(message = "Selecione a categoria") Long categoryId,
        @NotNull(message = "Informe a data") LocalDate date,
        @Size(max = 500, message = "As observações devem ter no maximo 500 caracteres") String notes) {}
