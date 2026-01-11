package com.fares.gestionrh.dto.notification;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestNotificationRequest {
    @NotBlank(message = "Le canal de notification est requis")
    private String channel; // "email", "slack", "sms"
}
