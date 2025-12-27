package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.Departement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DepartementRepository extends JpaRepository<Departement, Long> {
    Optional<Departement> findByNom(String nom);

    boolean existsByNom(String nom);
}
