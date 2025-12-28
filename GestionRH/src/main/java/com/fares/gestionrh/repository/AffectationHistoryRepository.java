package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.AffectationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AffectationHistoryRepository extends JpaRepository<AffectationHistory, Long> {
    List<AffectationHistory> findAllByOrderByDateChangementDesc();

    List<AffectationHistory> findByUtilisateurIdOrderByDateChangementDesc(Long utilisateurId);
}
