package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.SoldeConge;
import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoldeCongeRepository extends JpaRepository<SoldeConge, Long> {
    List<SoldeConge> findByUtilisateur(Utilisateur utilisateur);

        Optional<SoldeConge> findByUtilisateurAndTypeCongeAndAnnee(Utilisateur utilisateur, TypeConge typeConge,
            Integer annee);
    
    List<SoldeConge> findAllByUtilisateurAndTypeCongeAndAnnee(Utilisateur utilisateur, TypeConge typeConge,
            Integer annee);

        @Query(value = "select * from solde_conges sc where sc.utilisateur_id = :utilisateurId and sc.type_conge_id = :typeCongeId and sc.annee = :annee for update", nativeQuery = true)
        Optional<SoldeConge> findByUtilisateurAndTypeCongeAndAnneeForUpdate(
            @Param("utilisateurId") Long utilisateurId,
            @Param("typeCongeId") Long typeCongeId,
            @Param("annee") Integer annee);

    @Query(value = "select * from solde_conges sc where sc.utilisateur_id = :utilisateurId and sc.type_conge_id = :typeCongeId and sc.annee = :annee for update", nativeQuery = true)
    List<SoldeConge> findAllByUtilisateurAndTypeCongeAndAnneeForUpdate(
            @Param("utilisateurId") Long utilisateurId,
            @Param("typeCongeId") Long typeCongeId,
            @Param("annee") Integer annee);

    long countByTypeConge(TypeConge typeConge);
}
