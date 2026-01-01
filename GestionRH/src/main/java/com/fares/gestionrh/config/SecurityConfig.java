package com.fares.gestionrh.config;

import com.fares.gestionrh.security.JWTFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuration Spring Security avec JWT, CORS et contrôle d'accès par rôles
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JWTFilter jwtFilter;

    /**
     * Configuration du filtre de sécurité HTTP
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Désactiver CSRF (accepté avec JWT + Stateless)
                .csrf(csrf -> csrf.disable())
                
                // Configuration CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Stateless : pas de session (JWT)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // Configuration des autorizations
                .authorizeHttpRequests(auth -> auth
                        // Routes publiques
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        
                        // Routes Swagger/OpenAPI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        
                        // Routes admin
                        .requestMatchers(HttpMethod.POST, "/api/employes/**").hasAnyRole("ADMIN", "RH")
                        .requestMatchers(HttpMethod.PUT, "/api/employes/**").hasAnyRole("ADMIN", "RH")
                        .requestMatchers(HttpMethod.DELETE, "/api/employes/**").hasAnyRole("ADMIN", "RH")
                        .requestMatchers(HttpMethod.GET, "/api/employes/**").hasAnyRole("ADMIN", "RH", "MANAGER")
                        
                        // Routes pour départements (ADMIN only)
                        .requestMatchers("/api/departments/**").hasAnyRole("ADMIN", "RH")
                        
                        // Routes pour postes (ADMIN only)
                        .requestMatchers("/api/postes/**").hasAnyRole("ADMIN", "RH")
                        
                        // Routes pour congés (accessible à tous les users)
                        .requestMatchers(HttpMethod.GET, "/api/conges/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/conges/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/conges/**").hasAnyRole("ADMIN", "RH", "MANAGER")
                        
                        // Routes pour historique (ADMIN/RH)
                        .requestMatchers("/api/affectation-history/**").hasAnyRole("ADMIN", "RH")
                        
                        // Toutes les autres routes nécessitent l'authentification
                        .anyRequest().authenticated()
                )
                
                // Ajout du filtre JWT avant le filtre standard
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    /**
     * Configuration CORS pour accepter les requêtes du frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Domaines autorisés
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",      // React dev server default
            "http://localhost:3001",      // Vite dev server (current project)
            "http://localhost:5173",      // Vite alt port
            "http://127.0.0.1:5173",
            "http://localhost:4200"       // Angular alternative
        ));
        
        // Méthodes HTTP autorisées
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Headers autorisés
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Headers exposés au client
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count"));
        
        // Permettre les credentials (cookies)
        configuration.setAllowCredentials(true);
        
        // Cache de la préflightRequest
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Bean pour l'authentification
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Encodeur de mot de passe BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Force factor 12 pour plus de sécurité
    }
}
