package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.notification.NotificationPreferencesDTO;
import com.fares.gestionrh.entity.NotificationPreferences;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.repository.NotificationPreferencesRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationPreferencesServiceTest {

    @Mock
    private NotificationPreferencesRepository prefsRepo;
    @Mock
    private UtilisateurRepository userRepo;

    @InjectMocks
    private NotificationPreferencesService service;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("getPreferences creates defaults when missing")
    void getPreferencesCreatesDefaults() {
        String email = "user@example.com";
        when(prefsRepo.findByUtilisateurEmail(email)).thenReturn(Optional.empty());
        Utilisateur u = Utilisateur.builder().id(1L).email(email).nom("Test").prenom("User").build();
        when(userRepo.findByEmail(email)).thenReturn(Optional.of(u));
        when(prefsRepo.save(any(NotificationPreferences.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationPreferencesDTO dto = service.getPreferences(email);

        assertThat(dto.getEmailEnabled()).isTrue();
        assertThat(dto.getSlackEnabled()).isFalse();
        assertThat(dto.getSmsEnabled()).isFalse();
        verify(prefsRepo, times(1)).save(any(NotificationPreferences.class));
    }

    @Test
    @DisplayName("updatePreferences updates non-null fields")
    void updatePreferences() {
        String email = "user@example.com";
        Utilisateur u = Utilisateur.builder().id(1L).email(email).nom("Test").prenom("User").build();
        NotificationPreferences existing = NotificationPreferences.builder()
                .id(10L)
                .utilisateur(u)
                .emailEnabled(true)
                .slackEnabled(false)
                .smsEnabled(false)
                .build();
        when(prefsRepo.findByUtilisateurEmail(email)).thenReturn(Optional.of(existing));
        when(prefsRepo.save(any(NotificationPreferences.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationPreferencesDTO update = NotificationPreferencesDTO.builder()
                .emailEnabled(false)
                .slackEnabled(true)
                .build();

        NotificationPreferencesDTO saved = service.updatePreferences(email, update);

        assertThat(saved.getEmailEnabled()).isFalse();
        assertThat(saved.getSlackEnabled()).isTrue();
        assertThat(saved.getSmsEnabled()).isFalse();
        verify(prefsRepo, times(1)).save(any(NotificationPreferences.class));
    }
}
