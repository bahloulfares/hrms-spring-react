package com.fares.gestionrh.event;

import com.fares.gestionrh.entity.Role;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.repository.UtilisateurRepository;
import com.fares.gestionrh.service.NotificationPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveEventListener {

    private final NotificationService notificationService;
    private final NotificationPersistenceService notificationPersistenceService;
    private final UtilisateurRepository utilisateurRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleLeaveEvent(LeaveEvent event) {
        log.info("Leave event: type={}, id={}, status={}, email={}, days={}",
                event.getType(), event.getLeaveId(), event.getStatus(), event.getEmployeeEmail(), event.getDurationDays());
        
        // Dispatch email/slack/sms notifications
        notificationService.dispatch(event);
        
        // Créer notification en base de données
        try {
            createDatabaseNotifications(event);
        } catch (Exception e) {
            log.error("Erreur lors de la création des notifications en DB pour l'événement {}", event.getLeaveId(), e);
        }
    }
    
    /**
     * Crée des notifications en base de données selon le type d'événement
     */
    private void createDatabaseNotifications(LeaveEvent event) {
        String employeeEmail = event.getEmployeeEmail();
        
        // Récupérer tous les admins et RH pour les notifier
        List<Utilisateur> adminsAndRH = new ArrayList<>();
        adminsAndRH.addAll(utilisateurRepository.findByRole(Role.ADMIN));
        adminsAndRH.addAll(utilisateurRepository.findByRole(Role.RH));
        
        switch (event.getType()) {
            case CREATED:
                // Notification pour l'employé lui-même (confirmation de création)
                if (employeeEmail != null) {
                    notificationPersistenceService.createNotificationFromEvent(event, employeeEmail);
                }
                // Notifier les admins et RH d'une nouvelle demande
                for (Utilisateur user : adminsAndRH) {
                    notificationPersistenceService.createNotificationFromEvent(event, user.getEmail());
                }
                log.info("Notifications créées pour nouvelle demande: employé + {} admins/RH", adminsAndRH.size());
                break;
                
            case APPROVED:
            case REJECTED:
                // Notification pour l'employé concerné
                if (employeeEmail != null) {
                    notificationPersistenceService.createNotificationFromEvent(event, employeeEmail);
                }
                log.info("Notification créée pour décision: employé {}", employeeEmail);
                break;
                
            case CANCELLED:
                // Notification pour l'employé
                if (employeeEmail != null) {
                    notificationPersistenceService.createNotificationFromEvent(event, employeeEmail);
                }
                // Notifier les admins et RH de l'annulation
                for (Utilisateur user : adminsAndRH) {
                    notificationPersistenceService.createNotificationFromEvent(event, user.getEmail());
                }
                log.info("Notifications créées pour annulation: employé + {} admins/RH", adminsAndRH.size());
                break;
        }
    }
}
