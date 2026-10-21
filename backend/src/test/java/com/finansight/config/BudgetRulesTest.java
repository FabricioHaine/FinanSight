package com.finansight.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.finansight.domain.enums.BudgetStatus;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BudgetRulesTest {

    private final BudgetRules rules = new BudgetRules();

    @Test
    @DisplayName("Classifica o orçamento como EM_DIA abaixo de 70% do limite")
    void shouldClassifyAsOnTrack() {
        assertThat(rules.status(new BigDecimal("1000.00"), new BigDecimal("500.00")))
                .isEqualTo(BudgetStatus.EM_DIA);
    }

    @Test
    @DisplayName("Classifica o orçamento como ATENCAO a partir de 70% do limite")
    void shouldClassifyAsAttention() {
        assertThat(rules.status(new BigDecimal("1000.00"), new BigDecimal("700.00")))
                .isEqualTo(BudgetStatus.ATENCAO);
        assertThat(rules.status(new BigDecimal("1000.00"), new BigDecimal("950.00")))
                .isEqualTo(BudgetStatus.ATENCAO);
    }

    @Test
    @DisplayName("Classifica o orçamento como EXCEDIDO acima do limite")
    void shouldClassifyAsExceeded() {
        assertThat(rules.status(new BigDecimal("1000.00"), new BigDecimal("1000.01")))
                .isEqualTo(BudgetStatus.EXCEDIDO);
    }

    @Test
    @DisplayName("Calcula o percentual utilizado com duas casas decimais")
    void shouldCalculatePercentUsed() {
        assertThat(rules.percentUsed(new BigDecimal("1500.00"), new BigDecimal("375.00")))
                .isEqualByComparingTo(new BigDecimal("25.00"));
        assertThat(rules.percentUsed(new BigDecimal("1500.00"), new BigDecimal("1000.00")))
                .isEqualByComparingTo(new BigDecimal("66.67"));
    }

    @Test
    @DisplayName("Nunca retorna valor restante negativo")
    void shouldNeverReturnNegativeRemaining() {
        assertThat(rules.remaining(new BigDecimal("100.00"), new BigDecimal("150.00")))
                .isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(rules.remaining(new BigDecimal("100.00"), new BigDecimal("40.00")))
                .isEqualByComparingTo(new BigDecimal("60.00"));
    }
}
