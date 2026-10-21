-- FinanSight - esquema inicial
-- Valores monetarios usam numeric(19,2) para representar centavos com precisao exata.

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    currency      VARCHAR(3)    NOT NULL DEFAULT 'BRL',
    monthly_income numeric(19, 2),
    savings_goal  VARCHAR(240),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ
);

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name        VARCHAR(80)  NOT NULL,
    type        VARCHAR(10)  NOT NULL,
    description VARCHAR(240),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ,
    CONSTRAINT uk_category_user_name UNIQUE (user_id, name),
    CONSTRAINT ck_category_type CHECK (type IN ('RECEITA', 'DESPESA'))
);

CREATE TABLE transactions (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id      BIGINT        NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    description      VARCHAR(160)  NOT NULL,
    amount           numeric(19, 2) NOT NULL,
    type             VARCHAR(10)   NOT NULL,
    transaction_date DATE          NOT NULL,
    notes            VARCHAR(500),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ,
    CONSTRAINT ck_transaction_type CHECK (type IN ('RECEITA', 'DESPESA')),
    CONSTRAINT ck_transaction_amount CHECK (amount > 0)
);

CREATE TABLE budgets (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id   BIGINT        NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    limit_amount  numeric(19, 2) NOT NULL,
    period        DATE          NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ,
    CONSTRAINT uk_budget_user_category_period UNIQUE (user_id, category_id, period),
    CONSTRAINT ck_budget_limit CHECK (limit_amount > 0)
);

CREATE TABLE financial_goals (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name              VARCHAR(120)  NOT NULL,
    target_amount     numeric(19, 2) NOT NULL,
    accumulated_amount numeric(19, 2) NOT NULL DEFAULT 0,
    start_date        DATE,
    deadline          DATE,
    description       VARCHAR(500),
    status            VARCHAR(12)   NOT NULL DEFAULT 'ATIVA',
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ,
    CONSTRAINT ck_goal_target CHECK (target_amount > 0),
    CONSTRAINT ck_goal_accumulated CHECK (accumulated_amount >= 0),
    CONSTRAINT ck_goal_status CHECK (status IN ('ATIVA', 'CONCLUÍDA', 'CANCELADA'))
);

CREATE TABLE goal_contributions (
    id               BIGSERIAL PRIMARY KEY,
    goal_id          BIGINT        NOT NULL REFERENCES financial_goals (id) ON DELETE CASCADE,
    user_id          BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amount           numeric(19, 2) NOT NULL,
    contribution_date DATE         NOT NULL,
    note             VARCHAR(240),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ,
    CONSTRAINT ck_contribution_amount CHECK (amount > 0)
);

CREATE INDEX idx_transactions_user_date ON transactions (user_id, transaction_date);
CREATE INDEX idx_transactions_category ON transactions (category_id);
CREATE INDEX idx_budgets_user_period ON budgets (user_id, period);
CREATE INDEX idx_goals_user ON financial_goals (user_id);
CREATE INDEX idx_contributions_goal ON goal_contributions (goal_id);
