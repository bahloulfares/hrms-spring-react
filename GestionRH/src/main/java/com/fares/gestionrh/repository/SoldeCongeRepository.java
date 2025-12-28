package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.SoldeConge;
import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoldeCongeRepository extends JpaRepository<SoldeConge, Long> {
    List<SoldeConge> findByUtilisateur(Utilisateur utilisateur);

    Optional<SoldeConge> findByUtilisateurAndTypeCongeAndAnnee(Utilisateur utilisateur, TypeConge typeConge,
            Integer annee);
}
