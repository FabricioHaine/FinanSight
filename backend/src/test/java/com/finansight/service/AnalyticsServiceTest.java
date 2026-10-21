package com.finansight.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.finansight.domain.enums.TransactionType;
import com.finansight.dto.SummaryResponse;
import com.finansight.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
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
class AnalyticsServiceTest {

    private static final Long USER_ID = 7L;
    private static final LocalDate FROM = LocalDate.of(2026, 3, 1);
    private static final LocalDate TO = LocalDate.of(2026, 3, 31);

    @Mock private TransactionRepository transactionRepository;

    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        analyticsService = new AnalyticsService(transactionRepository);
    }

    @Test
    @DisplayName("Saldo atual e o acumulado de todas as transações até o fim do período")
    void shouldComputeAccumulatedBalance() {
        when(transactionRepository.sumByTypeInPeriod(
                        any(), any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(transactionRepository.sumBalanceUntil(any(), any(), any()))
                .thenReturn(new BigDecimal("4250.00"));

        SummaryResponse summary = analyticsService.summary(USER_ID, FROM, TO, null);

        assertThat(summary.balance()).isEqualByComparingTo(new BigDecimal("4250.00"));
    }

    @Test
    @DisplayName("Economia do período e receitas menos despesas do intervalo")
    void shouldComputeSavingsForPeriod() {
        when(transactionRepository.sumByTypeInPeriod(any(), any(), any(), any(), any()))
                .thenAnswer(
                        invocation -> {
                            TransactionType type = invocation.getArgument(1);
                            return type == TransactionType.RECEITA
                                    ? new BigDecimal("8500.00")
                                    : new BigDecimal("5200.00");
                        });
        when(transactionRepository.sumBalanceUntil(any(), any(), any()))
                .thenReturn(new BigDecimal("3300.00"));

        SummaryResponse summary = analyticsService.summary(USER_ID, FROM, TO, null);

        assertThat(summary.revenues()).isEqualByComparingTo(new BigDecimal("8500.00"));
        assertThat(summary.expenses()).isEqualByComparingTo(new BigDecimal("5200.00"));
        assertThat(summary.savings()).isEqualByComparingTo(new BigDecimal("3300.00"));
    }

    @Test
    @DisplayName("Sem dados no período anterior a comparação e marcada como indisponivel")
    void shouldMarkComparisonAsUnavailable() {
        when(transactionRepository.sumByTypeInPeriod(any(), any(), any(), any(), any()))
                .thenAnswer(
                        invocation -> {
                            LocalDate from = invocation.getArgument(2);
                            return FROM.equals(from)
                                    ? new BigDecimal("100.00")
                                    : BigDecimal.ZERO;
                        });
        when(transactionRepository.sumBalanceUntil(any(), any(), any()))
                .thenReturn(new BigDecimal("100.00"));

        SummaryResponse summary = analyticsService.summary(USER_ID, FROM, TO, null);

        assertThat(summary.comparisonAvailable()).isFalse();
        assertThat(summary.revenuesVariation()).isNull();
    }

    @Test
    @DisplayName("A distribuição por categoria calcula o percentual de cada fatia")
    void shouldComputeCategoryDistribution() {
        when(transactionRepository.sumExpensesGroupedByCategory(any(), any(), any(), any()))
                .thenReturn(
                        java.util.List.of(
                                new Object[] {1L, "Moradia", new BigDecimal("750.00")},
                                new Object[] {2L, "Alimentação", new BigDecimal("250.00")}));

        var slices = analyticsService.categoryDistribution(USER_ID, FROM, TO, null);

        assertThat(slices).hasSize(2);
        assertThat(slices.get(0).percent()).isEqualByComparingTo(new BigDecimal("75.00"));
        assertThat(slices.get(1).percent()).isEqualByComparingTo(new BigDecimal("25.00"));
    }
}
