package com.finansight.dto;

import com.finansight.domain.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Informe o nome da categoria")
                @Size(max = 80, message = "O nome deve ter no maximo 80 caracteres")
                String name,
        @NotNull(message = "Selecione o tipo da categoria") CategoryType type,
        @Size(max = 240, message = "A descrição deve ter no maximo 240 caracteres") String description,
        Boolean active) {}
