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

        return new LoginResponse(token, user.getEmail(), user.getNomComplet(), user.getRoles());
    }
}