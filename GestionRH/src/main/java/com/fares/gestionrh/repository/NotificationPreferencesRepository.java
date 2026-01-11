package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.NotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, Long> {
    Optional<NotificationPreferences> findByUtilisateurEmail(String email);
}
