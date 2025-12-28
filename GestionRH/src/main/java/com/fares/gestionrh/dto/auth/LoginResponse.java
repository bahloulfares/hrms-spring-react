package com.fares.gestionrh.dto.auth;

import com.fares.gestionrh.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String email;
    private String nomComplet;
    private String prenom;
    private String nom;
    private String telephone;
    private String departement;
    private String poste;
    private Set<Role> roles;

    // Constructeur personnalisé (utilisé dans AuthenticationService)
    public LoginResponse(String token, String email, String nomComplet, Set<Role> roles) {
        this.token = token;
        this.type = "Bearer";
        this.email = email;
        this.nomComplet = nomComplet;
        this.roles = roles;
    }
}