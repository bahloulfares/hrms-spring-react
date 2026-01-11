package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.notification.NotificationPreferencesDTO;
import com.fares.gestionrh.dto.notification.TestNotificationRequest;
import com.fares.gestionrh.event.LeaveEvent;
import com.fares.gestionrh.event.NotificationService;
import com.fares.gestionrh.service.NotificationPreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationPreferencesController {

    private final NotificationPreferencesService preferencesService;
    private final NotificationService notificationService;

    @GetMapping("/notification-preferences")
    public ResponseEntity<NotificationPreferencesDTO> getPreferences(Authentication auth) {
        return ResponseEntity.ok(preferencesService.getPreferences(auth.getName()));
    }

    @PostMapping("/notification-preferences")
    public ResponseEntity<NotificationPreferencesDTO> updatePreferences(
            @Valid @RequestBody NotificationPreferencesDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(preferencesService.updatePreferences(auth.getName(), dto));
    }

    @PostMapping("/test-notification")
    public ResponseEntity<Void> testNotification(
            @Valid @RequestBody TestNotificationRequest request,
            Authentication auth) {
        
        // Create a test event
        LeaveEvent testEvent = LeaveEvent.builder()
                .type(LeaveEvent.EventType.APPROVED)
                .leaveId(9999L)
                .employeeName(auth.getName())
                .employeeEmail(auth.getName())
                .status("TEST")
                .leaveType("Test Notification")
                .startDate(java.time.LocalDate.now())
                .endDate(java.time.LocalDate.now().plusDays(1))
                .build();
        
        // Dispatch notification based on channel
        switch (request.getChannel().toLowerCase()) {
            case "email":
                notificationService.dispatch(testEvent);
                break;
            case "slack":
                notificationService.dispatch(testEvent);
                break;
            case "sms":
                notificationService.dispatch(testEvent);
                break;
            default:
                return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok().build();
    }
}
