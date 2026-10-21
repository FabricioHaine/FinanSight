package com.finansight.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Locale;

/**
 * Conta de acesso do usuário. A senha nunca e armazenada em texto puro:
 * apenas o hash BCrypt e persistido.
 */
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 3)
    private String currency = "BRL";

    @Column(name = "monthly_income", precision = 19, scale = 2)
    private java.math.BigDecimal monthlyIncome;

    @Column(name = "savings_goal", length = 240)
    private String savingsGoal;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email == null ? null : email.toLowerCase(Locale.ROOT).trim();
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public java.math.BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(java.math.BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public String getSavingsGoal() {
        return savingsGoal;
    }

    public void setSavingsGoal(String savingsGoal) {
        this.savingsGoal = savingsGoal;
    }
}
