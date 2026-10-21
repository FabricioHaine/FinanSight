package com.finansight.support;

import java.time.LocalDate;
import org.springframework.stereotype.Component;

/**
 * Resolve o período solicitado pelas telas. Quando as datas não são informadas,
 * o período padrão e o mês corrente. Datas invertidas são corrigidas.
 */
@Component
public class PeriodResolver {

    public LocalDate[] resolve(LocalDate from, LocalDate to) {
        LocalDate effectiveTo = to == null ? LocalDate.now() : to;
        LocalDate effectiveFrom = from == null ? effectiveTo.withDayOfMonth(1) : from;
        if (effectiveFrom.isAfter(effectiveTo)) {
            LocalDate swap = effectiveFrom;
            effectiveFrom = effectiveTo;
            effectiveTo = swap;
        }
        return new LocalDate[] {effectiveFrom, effectiveTo};
    }
}
