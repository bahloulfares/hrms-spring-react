package com.fares.gestionrh.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    @Column(name = "email_enabled")
    @Builder.Default
    private Boolean emailEnabled = true;

    @Column(name = "slack_enabled")
    @Builder.Default
    private Boolean slackEnabled = false;

    @Column(name = "sms_enabled")
    @Builder.Default
    private Boolean smsEnabled = false;

    @UpdateTimestamp
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}
