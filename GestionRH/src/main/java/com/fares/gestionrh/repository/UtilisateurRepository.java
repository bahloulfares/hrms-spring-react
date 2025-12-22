package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Utilisateur> findByActifTrue();

    @Query("SELECT u FROM Utilisateur u JOIN u.roles r WHERE r = :role")
    List<Utilisateur> findByRole(@Param("role") Role role);

    @Query("SELECT u FROM Utilisateur u WHERE " +
            "LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Utilisateur> searchByNomOrPrenom(@Param("search") String search);
}
