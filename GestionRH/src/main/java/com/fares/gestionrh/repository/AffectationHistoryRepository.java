package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.AffectationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AffectationHistoryRepository extends JpaRepository<AffectationHistory, Long> {
    @Query("SELECT a FROM AffectationHistory a LEFT JOIN FETCH a.utilisateur ORDER BY a.dateChangement DESC")
    List<AffectationHistory> findAllByOrderByDateChangementDesc();

    @Query("SELECT a FROM AffectationHistory a LEFT JOIN FETCH a.utilisateur WHERE a.utilisateur.id = :utilisateurId ORDER BY a.dateChangement DESC")
    List<AffectationHistory> findByUtilisateurIdOrderByDateChangementDesc(@Param("utilisateurId") Long utilisateurId);
}
