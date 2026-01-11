package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.notification.NotificationPreferencesDTO;
import com.fares.gestionrh.entity.NotificationPreferences;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.repository.NotificationPreferencesRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferencesService {

    private final NotificationPreferencesRepository preferencesRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional(readOnly = true)
    public NotificationPreferencesDTO getPreferences(String email) {
        NotificationPreferences prefs = preferencesRepository.findByUtilisateurEmail(email)
                .orElseGet(() -> createDefaultPreferences(email));
        
        return NotificationPreferencesDTO.builder()
                .emailEnabled(prefs.getEmailEnabled())
                .slackEnabled(prefs.getSlackEnabled())
                .smsEnabled(prefs.getSmsEnabled())
                .build();
    }

    @Transactional
    public NotificationPreferencesDTO updatePreferences(String email, NotificationPreferencesDTO dto) {
        NotificationPreferences prefs = preferencesRepository.findByUtilisateurEmail(email)
                .orElseGet(() -> createDefaultPreferences(email));
        
        // Update only non-null fields
        if (dto.getEmailEnabled() != null) {
            prefs.setEmailEnabled(dto.getEmailEnabled());
        }
        if (dto.getSlackEnabled() != null) {
            prefs.setSlackEnabled(dto.getSlackEnabled());
        }
        if (dto.getSmsEnabled() != null) {
            prefs.setSmsEnabled(dto.getSmsEnabled());
        }
        
        NotificationPreferences saved = preferencesRepository.save(prefs);
        log.info("Préférences de notifications mises à jour pour l'utilisateur: {}", email);
        
        return NotificationPreferencesDTO.builder()
                .emailEnabled(saved.getEmailEnabled())
                .slackEnabled(saved.getSlackEnabled())
                .smsEnabled(saved.getSmsEnabled())
                .build();
    }

    private NotificationPreferences createDefaultPreferences(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + email));
        
        NotificationPreferences prefs = NotificationPreferences.builder()
                .utilisateur(utilisateur)
                .emailEnabled(true)
                .slackEnabled(false)
                .smsEnabled(false)
                .build();
        
        return preferencesRepository.save(prefs);
    }
}
