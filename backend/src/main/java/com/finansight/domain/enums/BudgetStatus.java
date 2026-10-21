package com.finansight.domain.enums;

/**
 * Situacao de um orçamento mensal, calculada a partir do percentual utilizado.
 */
public enum BudgetStatus {
    /** Gasto abaixo de 70% do limite. */
    EM_DIA,
    /** Gasto entre 70% e 100% do limite. */
    ATENCAO,
    /** Gasto acima do limite definido. */
    EXCEDIDO
}
