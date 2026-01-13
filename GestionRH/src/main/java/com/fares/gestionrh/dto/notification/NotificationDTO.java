package com.fares.gestionrh.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    
    private Long id;
    private String type;
    private String titre;
    private String message;
    private Boolean lue;
    private Long congeId;
    private LocalDateTime dateCreation;
    
    // Données dénormalisées
    private String employeNom;
    private String typeConge;
    private String actionPar;
}
