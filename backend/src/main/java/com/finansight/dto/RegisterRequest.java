package com.finansight.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Informe seu nome")
                @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres")
                String name,
        @NotBlank(message = "Informe seu e-mail")
                @Email(message = "Informe um e-mail válido")
                @Size(max = 180)
                String email,
        @NotBlank(message = "Informe sua senha")
                @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres")
                String password) {}
