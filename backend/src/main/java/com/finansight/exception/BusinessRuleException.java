package com.finansight.exception;

/**
 * Regra de negócio violada (ex.: categoria em uso, meta já concluída).
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
