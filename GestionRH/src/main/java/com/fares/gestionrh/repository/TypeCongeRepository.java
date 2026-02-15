package com.fares.gestionrh.repository;

import com.fares.gestionrh.entity.TypeConge;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypeCongeRepository extends JpaRepository<TypeConge, Long> {
    
    @Cacheable(value = "typeCongeByCode", key = "#code")
    Optional<TypeConge> findByCode(String code);

    @Cacheable(value = "typeCongeByNom", key = "#nom")
    Optional<TypeConge> findByNom(String nom);
    
    @Cacheable(value = "allTypeCongesAll")
    List<TypeConge> findAll();

    @Cacheable(value = "allTypeCongesActive")
    List<TypeConge> findAllByActifTrue();

    @Cacheable(value = "allTypeCongesInactive")
    List<TypeConge> findAllByActifFalse();
}
