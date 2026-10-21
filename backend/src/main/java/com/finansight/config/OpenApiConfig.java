package com.finansight.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI finansightOpenApi() {
        String scheme = "bearerAuth";
        return new OpenAPI()
                .info(
                        new Info()
                                .title("FinanSight API")
                                .version("1.0.0")
                                .description(
                                        "API de gestao e inteligencia financeira pessoal. "
                                                + "Todos os recursos são isolados por usuário: "
                                                + "um usuário nunca acessa dados de outro.")
                                .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(scheme))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        scheme,
                                        new SecurityScheme()
                                                .name(scheme)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")));
    }
}
