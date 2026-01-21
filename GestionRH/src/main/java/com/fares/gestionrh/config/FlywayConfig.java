package com.fares.gestionrh.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway configuration - repair is configured via spring.flyway.repair-on-migrate property
 */
@Configuration
@Slf4j
public class FlywayConfig {
    // Flyway configuration is handled by Spring Boot properties:
    // - spring.flyway.repair-on-migrate=true
    // - spring.flyway.validate-on-migrate=false
    // - spring.flyway.out-of-order=true
}



