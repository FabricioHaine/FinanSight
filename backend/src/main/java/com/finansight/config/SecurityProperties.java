package com.finansight.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuração de segurança e autenticação, alimentada por variaveis de
 * ambiente (ver application.yml e .env.example).
 */
@ConfigurationProperties(prefix = "finansight.security")
public class SecurityProperties {

    /** Segredo usado para assinar os tokens JWT. Nunca deve ser commitado. */
    private String jwtSecret;

    /** Duracao da validade do token, em minutos. */
    private long jwtExpirationMinutes = 720;

    /** Origens autorizadas para chamadas CORS vindas do front-end. */
    private String[] allowedOrigins = {"http://localhost:4200"};

    public String getJwtSecret() {
        return jwtSecret;
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    public long getJwtExpirationMinutes() {
        return jwtExpirationMinutes;
    }

    public void setJwtExpirationMinutes(long jwtExpirationMinutes) {
        this.jwtExpirationMinutes = jwtExpirationMinutes;
    }

    public String[] getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public Duration expiration() {
        return Duration.ofMinutes(jwtExpirationMinutes);
    }
}
