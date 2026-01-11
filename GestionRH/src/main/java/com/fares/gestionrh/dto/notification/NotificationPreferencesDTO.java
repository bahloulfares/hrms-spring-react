package com.fares.gestionrh.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesDTO {
    private Boolean emailEnabled;
    private Boolean slackEnabled;
    private Boolean smsEnabled;
}
