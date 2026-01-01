package com.fares.gestionrh.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration OpenAPI 3.0 / Swagger
 * 
 * Accessible à: http://localhost:8088/swagger-ui.html
 * JSON: http://localhost:8088/v3/api-docs
 * YAML: http://localhost:8088/v3/api-docs.yaml
 */
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HRMS API")
                        .version("1.0.0")
                        .description("API de gestion des ressources humaines - Human Resource Management System")
                        .contact(new Contact()
                                .name("HRMS Team")
                                .email("admin@hrms.local")
                                .url("https://www.hrms.local"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token depuis /api/auth/login")));
    }
}
