package com.fares.gestionrh;

import com.fares.gestionrh.config.NotificationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableConfigurationProperties(NotificationProperties.class)
public class GestionRhApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionRhApplication.class, args);
        System.out.println("\n" +
                "╔══════════════════════════════════════════════════════╗\n" +
                "║   🚀 Application Gestion Congés Démarrée avec Succès ║\n" +
                "║   📍 URL: http://localhost:8088                      ║\n" +
                "║   📖 Docs: http://localhost:8088/api/auth/test      ║\n" +
                "╚══════════════════════════════════════════════════════╝\n"
        );
    }

}
