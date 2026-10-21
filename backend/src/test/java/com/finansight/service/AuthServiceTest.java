package com.finansight.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.finansight.domain.User;
import com.finansight.dto.RegisterRequest;
import com.finansight.dto.UserResponse;
import com.finansight.exception.BusinessRuleException;
import com.finansight.repository.UserRepository;
import com.finansight.security.CurrentUserProvider;
import com.finansight.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;
    @Mock private CurrentUserProvider currentUserProvider;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(4);
        authService =
                new AuthService(
                        userRepository,
                        passwordEncoder,
                        null,
                        jwtService,
                        currentUserProvider);
    }

    @Test
    @DisplayName("Cadastro armazena somente o hash da senha")
    void shouldStoreHashedPassword() {
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any()))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
                            user.setId(1L);
                            return user;
                        });
        when(jwtService.generateToken(any())).thenReturn("token.jwt.válido");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        var response =
                authService.register(
                        new RegisterRequest("Lucas", "Lucas@FinanSight.app", "segredo123"));

        assertThat(response.token()).isEqualTo("token.jwt.válido");
        assertThat(response.user().email()).isEqualTo("lucas@finansight.app");
        verify(userRepository)
                .save(
                        org.mockito.ArgumentMatchers.argThat(
                                user ->
                                        !user.getPasswordHash().equals("segredo123")
                                                && user.getPasswordHash().startsWith("$2")));
    }

    @Test
    @DisplayName("Cadastro recusa e-mails já cadastrados")
    void shouldRejectDuplicatedEmail() {
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(true);

        assertThatThrownBy(
                        () ->
                                authService.register(
                                        new RegisterRequest("Lucas", "lucas@finansight.app", "segredo123")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Já existe");
    }

    @Test
    @DisplayName("A senha nunca e retornada na resposta do perfil")
    void shouldNeverExposePassword() {
        User user = new User();
        user.setId(1L);
        user.setName("Lucas");
        user.setEmail("lucas@finansight.app");
        user.setPasswordHash(passwordEncoder.encode("segredo123"));
        when(currentUserProvider.getCurrentUser()).thenReturn(user);

        var response = authService.me();

        assertThat(response.email()).isEqualTo("lucas@finansight.app");
        assertThat(
                        java.util.Arrays.stream(UserResponse.class.getRecordComponents())
                                .map(java.lang.reflect.RecordComponent::getName))
                .doesNotContain("passwordHash", "password");
    }
}
