package com.fares.gestionrh.controller;

import com.fares.gestionrh.dto.notification.NotificationPreferencesDTO;
import com.fares.gestionrh.service.NotificationPreferencesService;
import com.fares.gestionrh.controller.NotificationPreferencesController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import com.fares.gestionrh.event.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.hamcrest.Matchers.is;

class NotificationPreferencesControllerTest {

        private NotificationPreferencesService service;
        private NotificationService notificationService;
        private NotificationPreferencesController controller;

    @Test
    @DisplayName("GET /api/users/me/notification-preferences returns DTO")
    void getPreferences() throws Exception {
        // Setup
        service = Mockito.mock(NotificationPreferencesService.class);
        notificationService = Mockito.mock(NotificationService.class);
        controller = new NotificationPreferencesController(service, notificationService);
        NotificationPreferencesDTO dto = NotificationPreferencesDTO.builder()
                .emailEnabled(true).slackEnabled(false).smsEnabled(false).build();
        Mockito.when(service.getPreferences("user@example.com")).thenReturn(dto);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("user@example.com", "password");
        ResponseEntity<NotificationPreferencesDTO> response = controller.getPreferences(auth);
        org.junit.jupiter.api.Assertions.assertEquals(200, response.getStatusCode().value());
        org.junit.jupiter.api.Assertions.assertTrue(response.getBody().getEmailEnabled());
        org.junit.jupiter.api.Assertions.assertFalse(response.getBody().getSlackEnabled());
        org.junit.jupiter.api.Assertions.assertFalse(response.getBody().getSmsEnabled());
    }

    @Test
    @DisplayName("POST /api/users/me/notification-preferences updates and returns DTO")
    void updatePreferences() throws Exception {
        // Setup
        service = Mockito.mock(NotificationPreferencesService.class);
        notificationService = Mockito.mock(NotificationService.class);
        controller = new NotificationPreferencesController(service, notificationService);
        NotificationPreferencesDTO update = NotificationPreferencesDTO.builder()
                .emailEnabled(false).slackEnabled(true).smsEnabled(false).build();
        Mockito.when(service.updatePreferences(Mockito.eq("user@example.com"), Mockito.any()))
                .thenReturn(update);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("user@example.com", "password");
        NotificationPreferencesDTO input = NotificationPreferencesDTO.builder().emailEnabled(false).slackEnabled(true).build();
        ResponseEntity<NotificationPreferencesDTO> response = controller.updatePreferences(input, auth);
        org.junit.jupiter.api.Assertions.assertEquals(200, response.getStatusCode().value());
        org.junit.jupiter.api.Assertions.assertFalse(response.getBody().getEmailEnabled());
        org.junit.jupiter.api.Assertions.assertTrue(response.getBody().getSlackEnabled());
        org.junit.jupiter.api.Assertions.assertFalse(response.getBody().getSmsEnabled());
    }
}
