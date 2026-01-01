package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.CongeHistorique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CongeHistoriqueRepository extends JpaRepository<CongeHistorique, Long> {

    /**
     * Récupère l'historique complet d'un congé
     */
    List<CongeHistorique> findByCongeOrderByDateModificationDesc(Conge conge);

    /**
     * Récupère l'historique d'un congé par son ID
     */
    List<CongeHistorique> findByCongeIdOrderByDateModificationDesc(Long congeId);
}
