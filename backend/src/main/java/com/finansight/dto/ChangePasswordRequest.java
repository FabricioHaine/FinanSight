package com.finansight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Informe a senha atual") String currentPassword,
        @NotBlank(message = "Informe a nova senha")
                @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres")
                String newPassword) {}
