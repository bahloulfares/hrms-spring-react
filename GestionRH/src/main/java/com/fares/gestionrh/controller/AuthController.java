package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.auth.LoginRequest;
import com.fares.gestionrh.dto.auth.LoginResponse;
import com.fares.gestionrh.dto.auth.RegisterRequest;
import com.fares.gestionrh.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authenticationService.authenticate(request);

        // Création du Cookie HttpOnly
        ResponseCookie cookie = ResponseCookie.from("token", loginResponse.getToken())
                .httpOnly(true)
                .secure(false) // Mettre à true en Production (HTTPS)
                .path("/")
                .maxAge(24 * 60 * 60) // 24 heures
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // On vide le token du corps de la réponse pour ne pas l'exposer
        loginResponse.setToken(null);

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authenticationService.register(request);

        ResponseCookie cookie = ResponseCookie.from("token", loginResponse.getToken())
                .httpOnly(true)
                .secure(false) // Mettre à true en Production (HTTPS)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // On évite de renvoyer le token en clair dans le corps
        loginResponse.setToken(null);

        return ResponseEntity.ok(loginResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser() {
        try {
            // L'utilisateur est déjà authentifié par le JWTFilter
            // On récupère l'email depuis le contexte de sécurité
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();

            if (principal instanceof String) { // C'est l'email (set dans JWTFilter)
                return ResponseEntity.ok(authenticationService.getCurrentUser());
            }
            
            // Si pas d'authentification valide, retourner 401
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            // En cas d'erreur (session expirée, user supprimé, etc.)
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("✅ API fonctionne !");
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false) // Mettre à true en Production (HTTPS)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }
}
