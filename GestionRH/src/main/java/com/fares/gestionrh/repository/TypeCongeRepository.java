package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.TypeConge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeCongeRepository extends JpaRepository<TypeConge, Long> {
    Optional<TypeConge> findByCode(String code);

    Optional<TypeConge> findByNom(String nom);
}
