package com.finansight.service;

import com.finansight.domain.User;
import com.finansight.dto.AuthResponse;
import com.finansight.dto.ChangePasswordRequest;
import com.finansight.dto.LoginRequest;
import com.finansight.dto.RegisterRequest;
import com.finansight.dto.UpdateProfileRequest;
import com.finansight.dto.UserResponse;
import com.finansight.exception.BusinessRuleException;
import com.finansight.repository.UserRepository;
import com.finansight.security.CurrentUserProvider;
import com.finansight.security.JwtService;
import java.util.Locale;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CurrentUserProvider currentUserProvider;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            CurrentUserProvider currentUserProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase(Locale.ROOT).trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessRuleException("Já existe uma conta com este e-mail");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCurrency("BRL");
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().toLowerCase(Locale.ROOT).trim(), request.password()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("E-mail ou senha incorretos");
        }
        User user =
                userRepository
                        .findByEmailIgnoreCase(request.email())
                        .orElseThrow(() -> new BadCredentialsException("E-mail ou senha incorretos"));
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me() {
        return UserResponse.from(currentUserProvider.getCurrentUser());
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUserProvider.getCurrentUser();
        user.setName(request.name().trim());
        user.setMonthlyIncome(request.monthlyIncome());
        user.setSavingsGoal(request.savingsGoal());
        userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = currentUserProvider.getCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("A senha atual não confere");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(
                token, "Bearer", jwtService.getExpirationSeconds(), UserResponse.from(user));
    }
}
