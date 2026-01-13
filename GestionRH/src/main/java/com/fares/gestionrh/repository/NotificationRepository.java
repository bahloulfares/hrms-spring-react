package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.Notification;
import com.fares.gestionrh.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Récupère les notifications d'un utilisateur triées par date (plus récentes en premier)
     * Limite à 50 pour performance
     */
    @Query("SELECT n FROM Notification n WHERE n.utilisateur.id = :userId " +
           "ORDER BY n.dateCreation DESC")
    List<Notification> findTop50ByUtilisateurIdOrderByDateCreationDesc(@Param("userId") Long userId);

    /**
     * Compte les notifications non lues d'un utilisateur
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.utilisateur.id = :userId AND n.lue = false")
    Long countUnreadByUtilisateurId(@Param("userId") Long userId);

    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     */
    @Modifying
    @Query("UPDATE Notification n SET n.lue = true WHERE n.utilisateur.id = :userId AND n.lue = false")
    int markAllAsReadByUtilisateurId(@Param("userId") Long userId);

    /**
     * Supprime les notifications anciennes (plus de 30 jours)
     * Utilisé pour le nettoyage périodique
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.dateCreation < :cutoffDate")
    int deleteOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Récupère les notifications d'un utilisateur (avec pagination implicite via limit)
     */
    List<Notification> findByUtilisateurOrderByDateCreationDesc(Utilisateur utilisateur);
}
