package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.notification.NotificationDTO;
import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.Notification;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.event.LeaveEvent;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.repository.NotificationRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la persistance et la gestion des notifications en base de données
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPersistenceService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Crée une notification en base de données à partir d'un événement de congé
     */
    @Transactional
    public void createNotificationFromEvent(LeaveEvent event, String recipientEmail) {
        Utilisateur recipient = utilisateurRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", recipientEmail));

        String titre = buildTitle(event);
        String message = buildMessage(event);

        Notification notification = Notification.builder()
                .utilisateur(recipient)
                .type(event.getType().name())
                .titre(titre)
                .message(message)
                .lue(false)
                .employeNom(event.getEmployeeName())
                .typeConge(event.getLeaveType())
                .build();

        notificationRepository.save(notification);
        log.debug("Notification créée pour {} : {}", recipientEmail, titre);
    }

    /**
     * Récupère toutes les notifications d'un utilisateur
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));

        List<Notification> notifications = notificationRepository
                .findTop50ByUtilisateurIdOrderByDateCreationDesc(user.getId());

        return notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Compte les notifications non lues
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));

        return notificationRepository.countUnreadByUtilisateurId(user.getId());
    }

    /**
     * Marque une notification comme lue
     */
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        // Vérifier que la notification appartient bien à l'utilisateur
        if (!notification.getUtilisateur().getEmail().equals(email)) {
            throw new RuntimeException("Accès non autorisé à cette notification");
        }

        notification.setLue(true);
        notificationRepository.save(notification);
        log.debug("Notification {} marquée comme lue", notificationId);
    }

    /**
     * Marque toutes les notifications comme lues
     */
    @Transactional
    public int markAllAsRead(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));

        int count = notificationRepository.markAllAsReadByUtilisateurId(user.getId());
        log.info("{} notifications marquées comme lues pour {}", count, email);
        return count;
    }

    /**
     * Supprime une notification
     */
    @Transactional
    public void deleteNotification(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        // Vérifier que la notification appartient bien à l'utilisateur
        if (!notification.getUtilisateur().getEmail().equals(email)) {
            throw new RuntimeException("Accès non autorisé à cette notification");
        }

        notificationRepository.delete(notification);
        log.debug("Notification {} supprimée", notificationId);
    }

    /**
     * Nettoyage périodique : supprime les notifications de plus de 30 jours
     */
    @Transactional
    public int cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        int deleted = notificationRepository.deleteOlderThan(cutoffDate);
        log.info("Nettoyage: {} notifications supprimées (>30 jours)", deleted);
        return deleted;
    }

    // --- Méthodes privées de construction ---

    private String buildTitle(LeaveEvent event) {
        return switch (event.getType()) {
            case CREATED -> "Nouvelle demande de congé";
            case APPROVED -> "Congé approuvé";
            case REJECTED -> "Congé refusé";
            case CANCELLED -> "Congé annulé";
        };
    }

    private String buildMessage(LeaveEvent event) {
        String employeeName = event.getEmployeeName() != null ? event.getEmployeeName() : "Un employé";
        String leaveType = event.getLeaveType() != null ? event.getLeaveType() : "congé";
        
        return switch (event.getType()) {
            case CREATED -> String.format("%s a créé une demande de %s du %s au %s (%.1f jours)",
                    employeeName, leaveType, event.getStartDate(), event.getEndDate(), event.getDurationDays());
            case APPROVED -> String.format("Votre demande de %s du %s au %s a été approuvée",
                    leaveType, event.getStartDate(), event.getEndDate());
            case REJECTED -> String.format("Votre demande de %s du %s au %s a été refusée",
                    leaveType, event.getStartDate(), event.getEndDate());
            case CANCELLED -> String.format("La demande de %s de %s du %s au %s a été annulée",
                    leaveType, employeeName, event.getStartDate(), event.getEndDate());
        };
    }

    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .titre(notification.getTitre())
                .message(notification.getMessage())
                .lue(notification.getLue())
                .congeId(notification.getConge() != null ? notification.getConge().getId() : null)
                .dateCreation(notification.getDateCreation())
                .employeNom(notification.getEmployeNom())
                .typeConge(notification.getTypeConge())
                .actionPar(notification.getActionPar())
                .build();
    }
}
