package com.fares.gestionrh.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fares.gestionrh.entity.Role;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (utilisateurRepository.count() == 0) {
            log.info("🔧 Initialisation des données...");
            createTestUsers();
            log.info("✅ Données créées !");
        }
    }

    private void createTestUsers() {
        utilisateurRepository.save(Utilisateur.builder()
                .nom("Admin").prenom("Système").email("admin@example.com")
                .motDePasse(passwordEncoder.encode("admin123"))
                .roles(Set.of(Role.ADMIN)).actif(true).build());
        log.info("✅ Admin: admin@example.com / admin123");

        utilisateurRepository.save(Utilisateur.builder()
                .nom("Dupont").prenom("Jean").email("manager@example.com")
                .motDePasse(passwordEncoder.encode("manager123"))
                .roles(Set.of(Role.MANAGER)).actif(true).build());
        log.info("✅ Manager: manager@example.com / manager123");

        utilisateurRepository.save(Utilisateur.builder()
                .nom("Martin").prenom("Marie").email("employee@example.com")
                .motDePasse(passwordEncoder.encode("employee123"))
                .roles(Set.of(Role.EMPLOYE)).actif(true).build());
        log.info("✅ Employee: employee@example.com / employee123");
    }
}