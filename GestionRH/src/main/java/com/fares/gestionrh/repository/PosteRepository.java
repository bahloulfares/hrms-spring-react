package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.Poste;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PosteRepository extends JpaRepository<Poste, Long> {
    List<Poste> findByDepartementId(Long departementId);

    Optional<Poste> findByTitre(String titre);
}
