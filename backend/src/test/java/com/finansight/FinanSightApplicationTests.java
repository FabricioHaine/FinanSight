package com.finansight;

import static org.assertj.core.api.Assertions.assertThat;

import com.finansight.config.OpenApiConfig;
import com.finansight.config.SecurityProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Verifica que o contexto da aplicação sobe com todas as configurações
 * (segurança, JPA, OpenAPI) usando um banco H2 em memoria.
 */
@SpringBootTest
class FinanSightApplicationTests {

    @Autowired private ApplicationContext applicationContext;

    @Autowired private SecurityProperties securityProperties;

    @Test
    @DisplayName("O contexto da aplicação e carregado com sucesso")
    void contextLoads() {
        assertThat(applicationContext).isNotNull();
        assertThat(applicationContext.getBean(SecurityFilterChain.class)).isNotNull();
        assertThat(applicationContext.getBean(OpenApiConfig.class)).isNotNull();
        assertThat(securityProperties.getJwtSecret()).isNotBlank();
    }
}
