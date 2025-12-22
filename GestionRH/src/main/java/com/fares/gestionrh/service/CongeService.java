package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.CongeResponse;
import com.fares.gestionrh.dto.conge.ValidationCongeRequest;
import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.StatutConge;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.exception.BusinessException;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.CongeMapper;
import com.fares.gestionrh.repository.CongeRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CongeService {

    private final CongeRepository congeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CongeMapper congeMapper;

    @Transactional
    public CongeResponse creerDemande(CongeRequest request, String email) {
        Utilisateur employe = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));

        validateDates(request.getDateDebut(), request.getDateFin());
        checkChevauchements(employe.getId(), request.getDateDebut(), request.getDateFin());

        Conge conge = congeMapper.toEntity(request, employe);
        Conge saved = congeRepository.save(conge);

        log.info("Congé créé: {} pour {}", saved.getId(), email);
        return congeMapper.toDTO(saved);
    }

    @Transactional
    public CongeResponse validerDemande(Long id, ValidationCongeRequest request, String validateurEmail) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Congé", "id", id));

        if (!StatutConge.EN_ATTENTE.equals(conge.getStatut())) {
            throw new BusinessException("Ce congé a déjà été traité");
        }

        Utilisateur validateur = utilisateurRepository.findByEmail(validateurEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", validateurEmail));

        // Déterminer le statut en fonction de la demande
        StatutConge nouveauStatut = "APPROUVE".equalsIgnoreCase(request.getStatut())
                ? StatutConge.APPROUVE
                : StatutConge.REJETE;

        conge.setStatut(nouveauStatut);
        conge.setValidateur(validateur);
        conge.setCommentaireValidation(request.getCommentaire());
        conge.setDateValidation(LocalDateTime.now());

        log.info("Congé {} {} par {}", id, nouveauStatut, validateurEmail);

        return congeMapper.toDTO(congeRepository.save(conge));
    }

    @Transactional
    public CongeResponse annulerDemande(Long id, String email) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Congé", "id", id));

        if (!conge.getEmploye().getEmail().equals(email)) {
            throw new BusinessException("Vous ne pouvez annuler que vos propres demandes");
        }

        // Vérifier si le congé peut être annulé (seulement EN_ATTENTE ou APPROUVE)
        if (conge.getStatut() != StatutConge.EN_ATTENTE && conge.getStatut() != StatutConge.APPROUVE) {
            throw new BusinessException("Ce congé ne peut pas être annulé");
        }

        conge.setStatut(StatutConge.ANNULE);
        log.info("Congé {} annulé", id);
        return congeMapper.toDTO(congeRepository.save(conge));
    }

    @Transactional(readOnly = true)
    public List<CongeResponse> getMesConges(String email) {
        Utilisateur employe = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));
        return congeRepository.findByEmploye(employe).stream()
                .map(congeMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CongeResponse> getDemandesEnAttente() {
        return congeRepository.findCongesEnAttente().stream()
                .map(congeMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CongeResponse> getAllConges() {
        return congeRepository.findAll().stream()
                .map(congeMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CongeResponse getCongeById(Long id) {
        Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Congé", "id", id));
        return congeMapper.toDTO(conge);
    }

    private void validateDates(LocalDate debut, LocalDate fin) {
        if (debut == null || fin == null) {
            throw new BusinessException("Les dates sont obligatoires");
        }
        if (fin.isBefore(debut)) {
            throw new BusinessException("La date de fin doit être après la date de début");
        }
        if (debut.isBefore(LocalDate.now())) {
            throw new BusinessException("La date de début ne peut pas être dans le passé");
        }
    }

    private void checkChevauchements(Long employeId, LocalDate debut, LocalDate fin) {
        List<Conge> chevauchements = congeRepository.findChevauchements(employeId, debut, fin);
        if (!chevauchements.isEmpty()) {
            throw new BusinessException("Chevauchement avec un congé existant");
        }
    }
}