package com.fares.gestionrh.dto.utilisateur;
import com.fares.gestionrh.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUtilisateurRequest {
    @Email(message = "Format d'email invalide")
    private String email;
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    private String nom;
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    private String prenom;
    @Pattern(regexp = "^[0-9]{10}$", message = "Le téléphone doit contenir 10 chiffres")
    private String telephone;
    @Size(max = 100, message = "Le poste ne peut pas dépasser 100 caractères")
    private String poste;
    @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
    private String departement;
    private Set<Role> roles;
    private Boolean actif;
}