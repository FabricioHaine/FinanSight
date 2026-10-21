package com.finansight.config;

import com.finansight.domain.enums.BudgetStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;

/**
 * Regras de negócio de orçamento, centralizadas para garantir calculo
 * consistente entre API, testes e documentacao.
 *
 * <ul>
 *   <li>gasto até 70% do limite: EM_DIA</li>
 *   <li>gasto entre 70% e 100%: ATENCAO</li>
 *   <li>gasto acima de 100%: EXCEDIDO</li>
 * </ul>
 */
@Component
public class BudgetRules {

    public static final BigDecimal ATTENTION_THRESHOLD = new BigDecimal("70");

    public BigDecimal remaining(BigDecimal limit, BigDecimal spent) {
        return limit.subtract(spent).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal percentUsed(BigDecimal limit, BigDecimal spent) {
        if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return spent.multiply(BigDecimal.valueOf(100))
                .divide(limit, 2, RoundingMode.HALF_UP);
    }

    public BudgetStatus status(BigDecimal limit, BigDecimal spent) {
        if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
            return BudgetStatus.EM_DIA;
        }
        if (spent.compareTo(limit) > 0) {
            return BudgetStatus.EXCEDIDO;
        }
        if (percentUsed(limit, spent).compareTo(ATTENTION_THRESHOLD) >= 0) {
            return BudgetStatus.ATENCAO;
        }
        return BudgetStatus.EM_DIA;
    }
}
