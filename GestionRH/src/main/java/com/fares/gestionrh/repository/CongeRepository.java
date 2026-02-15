package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CongeRepository extends JpaRepository<Conge, Long> {

        List<Conge> findByEmploye(Utilisateur employe);

        List<Conge> findByEmployeId(Long employeId);

        @Query("SELECT c FROM Conge c WHERE c.statut = :statut")
        List<Conge> findByStatut(@Param("statut") String statut);

        @Query("SELECT c FROM Conge c WHERE c.statut = 'EN_ATTENTE' AND c.employe.email != :excludedEmail ORDER BY c.dateDemande ASC")
        List<Conge> findCongesEnAttente(@Param("excludedEmail") String excludedEmail);

        @Query("SELECT c FROM Conge c WHERE c.statut = 'EN_ATTENTE' AND c.employe.departement.id = :deptId AND c.employe.email != :excludedEmail ORDER BY c.dateDemande ASC")
        List<Conge> findCongesEnAttenteParDepartement(@Param("deptId") Long deptId,
                        @Param("excludedEmail") String excludedEmail);

        @Query("SELECT c FROM Conge c WHERE c.employe.id = :employeId AND c.statut = :statut")
        List<Conge> findByEmployeIdAndStatut(@Param("employeId") Long employeId, @Param("statut") String statut);

        @Query("SELECT c FROM Conge c WHERE c.employe.id = :employeId " +
                        "AND c.statut != 'REJETE' AND c.statut != 'ANNULE' " +
                        "AND ((c.dateDebut <= :dateFin AND c.dateFin >= :dateDebut))")
        List<Conge> findChevauchements(@Param("employeId") Long employeId,
                        @Param("dateDebut") LocalDate dateDebut,
                        @Param("dateFin") LocalDate dateFin);

        @Query("SELECT COALESCE(SUM(DATEDIFF(c.dateFin, c.dateDebut) + 1), 0) " +
                        "FROM Conge c WHERE c.employe.id = :employeId AND c.statut = 'APPROUVE' " +
                        "AND YEAR(c.dateDebut) = :annee")
        Long countJoursApprouvesParAnnee(@Param("employeId") Long employeId, @Param("annee") int annee);

        @Query("SELECT c FROM Conge c WHERE c.dateDebut >= :dateDebut AND c.dateFin <= :dateFin ORDER BY c.dateDebut")
        List<Conge> findBetweenDates(@Param("dateDebut") LocalDate dateDebut, @Param("dateFin") LocalDate dateFin);

        List<Conge> findByValidateur(Utilisateur validateur);

        long countByType(TypeConge type);
}