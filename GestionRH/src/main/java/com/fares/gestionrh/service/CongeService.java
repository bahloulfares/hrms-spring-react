package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.CongeResponse;
import com.fares.gestionrh.dto.conge.SoldeCongeResponse;
import com.fares.gestionrh.dto.conge.ValidationCongeRequest;
import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.StatutConge;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.exception.BusinessException;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.CongeMapper;
import com.fares.gestionrh.repository.CongeRepository;
import com.fares.gestionrh.repository.SoldeCongeRepository;
import com.fares.gestionrh.repository.TypeCongeRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CongeService {

    private final CongeRepository congeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CongeMapper congeMapper;
    private final SoldeCongeRepository soldeCongeRepository;
    private final TypeCongeRepository typeCongeRepository;

    @Transactional
    public CongeResponse creerDemande(CongeRequest request, String email) {
        Utilisateur employe = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));

        validateDates(request.getDateDebut(), request.getDateFin());
        checkChevauchements(employe.getId(), request.getDateDebut(), request.getDateFin());

        // Vérification du solde
        TypeConge typeConge = typeCongeRepository.findByCode(request.getType().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("TypeConge", "code", request.getType()));

        long joursDemandes = ChronoUnit.DAYS.between(request.getDateDebut(), request.getDateFin()) + 1;
        int annee = request.getDateDebut().getYear();

        soldeCongeRepository.findByUtilisateurAndTypeCongeAndAnnee(employe, typeConge, annee)
                .ifPresent(solde -> {
                    if (solde.getJoursRestants() < joursDemandes) {
                        throw new BusinessException("Solde insuffisant pour ce type de congé ("
                                + solde.getJoursRestants() + " jours restants)");
                    }
                });
        // Note: Si aucun solde n'est trouvé, on considère qu'il n'y a pas encore de
        // quota défini ou que c'est illimité (à affiner selon les besoins)

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

        if (conge.getEmploye().getEmail().equals(validateurEmail)) {
            throw new BusinessException("Vous ne pouvez pas valider votre propre demande de congé");
        }

        Utilisateur validateur = utilisateurRepository.findByEmail(validateurEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", validateurEmail));

        // Sécurité supplémentaire (Cadenas) : Un manager ne peut valider que son
        // département
        boolean isAdmin = validateur.getRoles().contains(com.fares.gestionrh.entity.Role.ADMIN);
        boolean isRH = validateur.getRoles().contains(com.fares.gestionrh.entity.Role.RH);

        if (!isAdmin && !isRH) {
            boolean isManager = validateur.getRoles().contains(com.fares.gestionrh.entity.Role.MANAGER);
            Long employeDeptId = conge.getEmploye().getDepartement() != null
                    ? conge.getEmploye().getDepartement().getId()
                    : null;
            Long managerDeptId = validateur.getDepartement() != null ? validateur.getDepartement().getId() : null;

            if (isManager && (employeDeptId == null || !employeDeptId.equals(managerDeptId))) {
                throw new BusinessException(
                        "Accès refusé. Vous ne pouvez valider que les demandes de votre département.");
            }

            // Nouveau : Un manager ne peut valider QUE des EMPLOYE (pas les autres
            // Managers/RH/Admin)
            boolean cibleIsSimpleEmploye = conge.getEmploye().getRoles().size() == 1 &&
                    conge.getEmploye().getRoles().contains(com.fares.gestionrh.entity.Role.EMPLOYE);

            if (isManager && !cibleIsSimpleEmploye) {
                throw new BusinessException(
                        "Accès refusé. Un manager ne peut valider que les demandes des employés standard.");
            }
        }

        // Nouveau : Un RH ne peut pas valider un ADMIN
        if (isRH && !isAdmin) {
            boolean cibleIsAdmin = conge.getEmploye().getRoles().contains(com.fares.gestionrh.entity.Role.ADMIN);
            if (cibleIsAdmin) {
                throw new BusinessException("Accès refusé. Seul un Administrateur peut valider les congés d'un Admin.");
            }
        }

        // Déterminer le statut en fonction de la demande
        StatutConge nouveauStatut = "APPROUVE".equalsIgnoreCase(request.getStatut())
                ? StatutConge.APPROUVE
                : StatutConge.REJETE;

        conge.setStatut(nouveauStatut);
        conge.setValidateur(validateur);
        conge.setCommentaireValidation(request.getCommentaire());
        conge.setDateValidation(LocalDateTime.now());

        // Si approuvé, déduire du solde
        if (StatutConge.APPROUVE.equals(nouveauStatut)) {
            deduireDuSolde(conge);
        }

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

        StatutConge ancienStatut = conge.getStatut();
        conge.setStatut(StatutConge.ANNULE);

        // Si le congé était déjà approuvé, on recrédite le solde
        if (StatutConge.APPROUVE.equals(ancienStatut)) {
            recrediterLeSolde(conge);
        }

        log.info("Congé {} annulé", id);
        return congeMapper.toDTO(congeRepository.save(conge));
    }

    private void deduireDuSolde(Conge conge) {
        int annee = conge.getDateDebut().getYear();
        soldeCongeRepository.findByUtilisateurAndTypeCongeAndAnnee(conge.getEmploye(), conge.getType(), annee)
                .ifPresent(solde -> {
                    double nouveauxJours = solde.getJoursRestants() - conge.getNombreJours();
                    solde.setJoursRestants(nouveauxJours);
                    soldeCongeRepository.save(solde);
                });
    }

    private void recrediterLeSolde(Conge conge) {
        int annee = conge.getDateDebut().getYear();
        soldeCongeRepository.findByUtilisateurAndTypeCongeAndAnnee(conge.getEmploye(), conge.getType(), annee)
                .ifPresent(solde -> {
                    double nouveauxJours = solde.getJoursRestants() + conge.getNombreJours();
                    solde.setJoursRestants(nouveauxJours);
                    soldeCongeRepository.save(solde);
                });
    }

    @Transactional(readOnly = true)
    public List<CongeResponse> getMesConges(String email) {
        Utilisateur employe = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));
        return congeRepository.findByEmploye(employe).stream()
                .map(congeMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CongeResponse> getDemandesEnAttente(String email) {
        Utilisateur current = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));

        boolean isAdmin = current.getRoles().contains(com.fares.gestionrh.entity.Role.ADMIN);
        boolean isRH = current.getRoles().contains(com.fares.gestionrh.entity.Role.RH);
        boolean isManager = current.getRoles().contains(com.fares.gestionrh.entity.Role.MANAGER);

        List<Conge> conges;
        if (isAdmin) {
            conges = congeRepository.findCongesEnAttente(email);
        } else if (isRH) {
            // RH voit tout sauf les ADMIN
            conges = congeRepository.findCongesEnAttente(email).stream()
                    .filter(c -> !c.getEmploye().getRoles().contains(com.fares.gestionrh.entity.Role.ADMIN))
                    .collect(Collectors.toList());
        } else if (isManager && current.getDepartement() != null) {
            // Manager voit son département mais uniquement les EMPLOYE simples
            conges = congeRepository.findCongesEnAttenteParDepartement(current.getDepartement().getId(), email).stream()
                    .filter(c -> c.getEmploye().getRoles().size() == 1 &&
                            c.getEmploye().getRoles().contains(com.fares.gestionrh.entity.Role.EMPLOYE))
                    .collect(Collectors.toList());
        } else {
            return List.of();
        }

        return conges.stream()
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

    @Transactional(readOnly = true)
    public List<SoldeCongeResponse> getMesSoldes(String email) {
        Utilisateur employe = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));
        return soldeCongeRepository.findByUtilisateur(employe).stream()
                .map(this::mapToSoldeDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TypeConge> getAllTypes() {
        return typeCongeRepository.findAll();
    }

    private SoldeCongeResponse mapToSoldeDTO(com.fares.gestionrh.entity.SoldeConge solde) {
        return SoldeCongeResponse.builder()
                .id(solde.getId())
                .typeCongeNom(solde.getTypeConge().getNom())
                .typeCongeCode(solde.getTypeConge().getCode())
                .joursRestants(solde.getJoursRestants())
                .annee(solde.getAnnee())
                .build();
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