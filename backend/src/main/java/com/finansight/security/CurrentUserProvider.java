package com.finansight.security;

import com.finansight.domain.User;
import com.finansight.exception.ResourceNotFoundException;
import com.finansight.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Resolve o usuário autenticado a partir do contexto de segurança.
 * Todo acesso a dados da API parte daqui, garantindo o isolamento entre usuários.
 */
@Component
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public CurrentUserProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("Usuário não autenticado");
        }
        String email = authentication.getName();
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não autenticado"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
