package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.auth.LoginRequest;
import com.fares.gestionrh.dto.auth.LoginResponse;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.exception.AuthenticationException;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UtilisateurRepository utilisateurRepository;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public LoginResponse authenticate(LoginRequest request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Identifiants invalides"));

        if (!user.getActif()) {
            throw new AuthenticationException("Compte désactivé");
        }

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            log.warn("Échec connexion: {}", request.getEmail());
            throw new AuthenticationException("Identifiants invalides");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRoles());
        log.info("Connexion: {}", user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .nomComplet(user.getNomComplet())
                .prenom(user.getPrenom())
                .nom(user.getNom())
                .telephone(user.getTelephone())
                .departement(user.getDepartement() != null ? user.getDepartement().getNom() : null)
                .poste(user.getPoste() != null ? user.getPoste().getTitre() : null)
                .roles(user.getRoles())
                .build();
    }

    public LoginResponse getCurrentUser() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        if (!(principal instanceof String)) {
            throw new AuthenticationException("Session invalide");
        }

        String email = (String) principal;
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Utilisateur non trouvé"));

        return LoginResponse.builder()
                .email(user.getEmail())
                .nomComplet(user.getNomComplet())
                .prenom(user.getPrenom())
                .nom(user.getNom())
                .telephone(user.getTelephone())
                .departement(user.getDepartement() != null ? user.getDepartement().getNom() : null)
                .poste(user.getPoste() != null ? user.getPoste().getTitre() : null)
                .roles(user.getRoles())
                .build();
    }
}