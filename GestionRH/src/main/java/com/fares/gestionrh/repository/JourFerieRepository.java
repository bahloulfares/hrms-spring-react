package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.JourFerie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JourFerieRepository extends JpaRepository<JourFerie, Long> {

    /**
     * Trouve tous les jours fériés dans une période donnée
     */
    @Query("SELECT j FROM JourFerie j WHERE j.date >= :debut AND j.date <= :fin")
    List<JourFerie> findBetweenDates(@Param("debut") LocalDate debut, @Param("fin") LocalDate fin);

    /**
     * Trouve tous les jours fériés pour une année donnée
     */
    @Query("SELECT j FROM JourFerie j WHERE YEAR(j.date) = :annee ORDER BY j.date")
    List<JourFerie> findByAnnee(@Param("annee") int annee);

    /**
     * Vérifie si une date est un jour férié
     */
    boolean existsByDate(LocalDate date);
}
