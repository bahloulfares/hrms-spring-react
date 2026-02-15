package com.fares.gestionrh.service;

import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.repository.CongeRepository;
import com.fares.gestionrh.repository.TypeCongeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TypeCongeService {

    private final TypeCongeRepository typeCongeRepository;
    private final CongeRepository congeRepository;

    public List<TypeConge> getAllTypes() {
        return typeCongeRepository.findAllByActifTrue();
    }

    public List<TypeConge> getAllTypesIncludingInactive() {
        return typeCongeRepository.findAll();
    }

    public List<TypeConge> getInactiveTypes() {
        return typeCongeRepository.findAllByActifFalse();
    }

    @Transactional
    @CacheEvict(cacheNames = {"allTypeCongesAll", "allTypeCongesActive", "allTypeCongesInactive"}, allEntries = true)
    public TypeConge createType(TypeConge typeConge) {
        // Validation du nom
        if (typeConge.getNom() == null || typeConge.getNom().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du type de congé est obligatoire");
        }
        if (typeConge.getNom().length() > 100) {
            throw new IllegalArgumentException("Le nom ne doit pas dépasser 100 caractères");
        }
        
        // Validation du code
        if (typeConge.getCode() == null || typeConge.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Le code du type de congé est obligatoire");
        }
        if (typeConge.getCode().length() > 20) {
            throw new IllegalArgumentException("Le code ne doit pas dépasser 20 caractères");
        }
        if (!typeConge.getCode().matches("^[A-Z0-9_]+$")) {
            throw new IllegalArgumentException("Le code doit contenir uniquement des lettres majuscules, chiffres et underscores");
        }
        
        // Validation de l'unicité du code
        if (typeCongeRepository.findByCode(typeConge.getCode()).isPresent()) {
            throw new IllegalArgumentException("Un type avec ce code existe déjà");
        }
        
        // Validation des jours par an
        if (typeConge.getJoursParAn() == null || typeConge.getJoursParAn() <= 0) {
            throw new IllegalArgumentException("Le nombre de jours par an doit être supérieur à 0");
        }
        if (typeConge.getJoursParAn() > 365) {
            throw new IllegalArgumentException("Le nombre de jours par an ne peut pas dépasser 365");
        }
        
        // Initialiser le champ actif si null
        if (typeConge.getActif() == null) {
            typeConge.setActif(true);
        }
        
        return typeCongeRepository.save(typeConge);
    }

    @Transactional
    @CacheEvict(cacheNames = {"allTypeCongesAll", "allTypeCongesActive", "allTypeCongesInactive"}, allEntries = true)
    public TypeConge updateType(Long id, TypeConge typeDetails) {
        TypeConge type = typeCongeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type non trouvé"));

        type.setNom(typeDetails.getNom());
        type.setCode(typeDetails.getCode());
        type.setJoursParAn(typeDetails.getJoursParAn());

        return typeCongeRepository.save(type);
    }

    @Transactional
    @CacheEvict(cacheNames = {"allTypeCongesAll", "allTypeCongesActive", "allTypeCongesInactive"}, allEntries = true)
    public void deleteType(Long id) {
        TypeConge type = typeCongeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type non trouvé"));
        
        // VALIDATION : Vérifier si des demandes de congé existent pour ce type
        // Un type ne peut être désactivé QUE s'il n'a jamais été utilisé pour une demande
        long nombreConges = congeRepository.countByType(type);
        if (nombreConges > 0) {
            throw new IllegalStateException(
                String.format("Impossible de désactiver ce type de congé : %d demande(s) de congé l'utilisent actuellement ou l'ont utilisé dans le passé. " +
                             "Les types de congés ne peuvent pas être supprimés s'ils ont un historique de demandes.", nombreConges)
            );
        }
        
        // Note : On ne vérifie PAS les soldes car ils sont initialisés automatiquement
        // Un solde initialisé mais jamais utilisé (aucune demande) n'est pas bloquant
        // Les soldes "orphelins" seront automatiquement nettoyés lors de la désactivation
        
        // Désactiver le type (soft delete)
        type.setActif(false);
        typeCongeRepository.save(type);
    }

    @Transactional
    @CacheEvict(cacheNames = {"allTypeCongesAll", "allTypeCongesActive", "allTypeCongesInactive"}, allEntries = true)
    public TypeConge reactivateType(Long id) {
        TypeConge type = typeCongeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type non trouvé"));
        type.setActif(true);
        return typeCongeRepository.save(type);
    }
}
