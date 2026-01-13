package com.fares.gestionrh.event;

import com.fares.gestionrh.service.NotificationPersistenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveEventListener {

    private final NotificationService notificationService;
    private final NotificationPersistenceService notificationPersistenceService;

    @Async
    @EventListener
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
        
        switch (event.getType()) {
            case CREATED:
                // Notification pour l'employé lui-même (confirmation)
                if (employeeEmail != null) {
                    notificationPersistenceService.createNotificationFromEvent(event, employeeEmail);
                }
                // TODO: Notifier aussi le manager et RH (nécessite récupération depuis DB)
                break;
                
            case APPROVED:
            case REJECTED:
                // Notification pour l'employé concerné
                if (employeeEmail != null) {
                    notificationPersistenceService.createNotificationFromEvent(event, employeeEmail);
                }
                break;
                
            case CANCELLED:
                // Notification pour l'employé
                if (employeeEmail != null) {
                    notificationPersistenceService.createNotificationFromEvent(event, employeeEmail);
                }
                break;
        }
    }
}
