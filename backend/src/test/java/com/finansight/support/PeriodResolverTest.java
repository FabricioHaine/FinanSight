package com.finansight.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PeriodResolverTest {

    private final PeriodResolver resolver = new PeriodResolver();

    @Test
    @DisplayName("Usa o mês corrente quando nenhuma data e informada")
    void shouldDefaultToCurrentMonth() {
        LocalDate[] period = resolver.resolve(null, null);
        assertThat(period[0]).isEqualTo(period[1].withDayOfMonth(1));
        assertThat(period[1]).isBeforeOrEqualTo(LocalDate.now());
    }

    @Test
    @DisplayName("Corrige datas invertidas")
    void shouldSwapInvertedDates() {
        LocalDate[] period = resolver.resolve(LocalDate.of(2026, 3, 31), LocalDate.of(2026, 1, 1));
        assertThat(period[0]).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(period[1]).isEqualTo(LocalDate.of(2026, 3, 31));
    }

    @Test
    @DisplayName("Mantem o período informado")
    void shouldKeepProvidedPeriod() {
        LocalDate[] period =
                resolver.resolve(LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 28));
        assertThat(period[0]).isEqualTo(LocalDate.of(2026, 2, 1));
        assertThat(period[1]).isEqualTo(LocalDate.of(2026, 2, 28));
    }
}
