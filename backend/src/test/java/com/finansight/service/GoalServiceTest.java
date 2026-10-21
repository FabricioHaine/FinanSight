package com.finansight.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.finansight.domain.FinancialGoal;
import com.finansight.domain.GoalContribution;
import com.finansight.domain.User;
import com.finansight.domain.enums.GoalStatus;
import com.finansight.dto.ContributionRequest;
import com.finansight.dto.GoalRequest;
import com.finansight.exception.BusinessRuleException;
import com.finansight.repository.FinancialGoalRepository;
import com.finansight.repository.GoalContributionRepository;
import com.finansight.security.CurrentUserProvider;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GoalServiceTest {

    @Mock private FinancialGoalRepository goalRepository;
    @Mock private GoalContributionRepository contributionRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    private GoalService goalService;
    private User user;
    private FinancialGoal goal;

    @BeforeEach
    void setUp() {
        goalService = new GoalService(goalRepository, contributionRepository, currentUserProvider);

        user = new User();
        user.setId(1L);
        user.setEmail("lucas@finansight.app");

        goal = new FinancialGoal();
        goal.setId(5L);
        goal.setUser(user);
        goal.setName("Reserva de emergência");
        goal.setTargetAmount(new BigDecimal("1000.00"));
        goal.setAccumulatedAmount(BigDecimal.ZERO);
        goal.setStatus(GoalStatus.ATIVA);
        goal.setStartDate(LocalDate.of(2026, 1, 1));
        goal.setDeadline(LocalDate.of(2026, 12, 31));

        when(currentUserProvider.getCurrentUser()).thenReturn(user);
        when(currentUserProvider.getCurrentUserId()).thenReturn(1L);
        when(goalRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(goal));
    }

    @Test
    @DisplayName("Registra contribuição e atualiza o valor acumulado")
    void shouldAddContribution() {
        when(contributionRepository.save(any()))
                .thenAnswer(
                        invocation -> {
                            GoalContribution contribution = invocation.getArgument(0);
                            contribution.setId(1L);
                            return contribution;
                        });
        when(contributionRepository.sumByGoalId(5L)).thenReturn(new BigDecimal("250.00"));

        var response =
                goalService.addContribution(
                        5L,
                        new ContributionRequest(
                                new BigDecimal("250.00"), LocalDate.of(2026, 3, 1), "aporte"));

        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("250.00"));
        assertThat(goal.getAccumulatedAmount()).isEqualByComparingTo(new BigDecimal("250.00"));
        assertThat(goal.getStatus()).isEqualTo(GoalStatus.ATIVA);
    }

    @Test
    @DisplayName("Conclui a meta quando o acumulado alcança o valor desejado")
    void shouldCompleteGoal() {
        when(contributionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(contributionRepository.sumByGoalId(5L)).thenReturn(new BigDecimal("1000.00"));

        goalService.addContribution(
                5L,
                new ContributionRequest(
                        new BigDecimal("1000.00"), LocalDate.of(2026, 3, 1), null));

        assertThat(goal.getStatus()).isEqualTo(GoalStatus.CONCLUÍDA);
        var response = goalService.findById(5L);
        assertThat(response.percentComplete()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(response.remainingAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Rejeita prazo anterior a data de início")
    void shouldRejectInvalidDates() {
        GoalRequest request =
                new GoalRequest(
                        "Meta",
                        new BigDecimal("100.00"),
                        LocalDate.of(2026, 5, 1),
                        LocalDate.of(2026, 1, 1),
                        null);

        assertThatThrownBy(() -> goalService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("prazo");
    }

    @Test
    @DisplayName("Marca a meta como atrasada quando o prazo já passou")
    void shouldFlagOverdueGoal() {
        goal.setDeadline(LocalDate.now().minusDays(5));
        var response = goalService.findById(5L);
        assertThat(response.overdue()).isTrue();
    }
}
