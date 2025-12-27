package com.fares.gestionrh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
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
