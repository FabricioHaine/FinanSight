package com.finansight.security;

import com.finansight.repository.UserRepository;
import java.util.Collections;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.finansight.domain.User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(
                                () -> new UsernameNotFoundException("Usuário não encontrado"));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.emptyList());
    }

    public org.springframework.security.core.userdetails.UserDetails loadByUserId(Long userId) {
        com.finansight.domain.User user =
                userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), Collections.emptyList());
    }

    public org.springframework.security.core.userdetails.UserDetails principal(String email) {
        return loadUserByUsername(email);
    }

    public org.springframework.security.core.userdetails.UserDetails anonymousPrincipal() {
        return new org.springframework.security.core.userdetails.User(
                "system", "system", AuthorityUtils.NO_AUTHORITIES);
    }
}
