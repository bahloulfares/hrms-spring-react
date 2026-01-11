package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.conge.CongeReportRequest;
import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.CongeResponse;
import com.fares.gestionrh.dto.conge.CongeStatsResponse;
import com.fares.gestionrh.dto.conge.SoldeCongeResponse;
import com.fares.gestionrh.dto.conge.ValidationCongeRequest;
import com.fares.gestionrh.entity.Conge;
import com.fares.gestionrh.entity.CongeHistorique;
import com.fares.gestionrh.entity.SoldeConge;
import com.fares.gestionrh.entity.StatutConge;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.event.LeaveEvent;
import com.fares.gestionrh.exception.BusinessException;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.CongeMapper;
import com.fares.gestionrh.repository.CongeRepository;
import com.fares.gestionrh.repository.CongeHistoriqueRepository;
import com.fares.gestionrh.repository.SoldeCongeRepository;
import com.fares.gestionrh.repository.TypeCongeRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final CongeHistoriqueRepository congeHistoriqueRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.workday.hours:8}")
    private double workdayHours;

    @Transactional
    public CongeResponse creerDemande(CongeRequest request, String email) {
        Utilisateur employe = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));

        Conge.DureeType dureeType = parseDureeType(request.getDureeType());
        validateDates(request, dureeType);
        checkChevauchements(employe.getId(), request.getDateDebut(), request.getDateFin());

        // Vérification du solde
        TypeConge typeConge = typeCongeRepository.findByCode(request.getType().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("TypeConge", "code", request.getType()));

        // Préparer l'entité avec la durée demandée
        Conge conge = congeMapper.toEntity(request, employe);
        conge.setDureeType(dureeType);

        // Calcul des jours par année (inclut demi-journée / horaire)
        Map<Integer, Double> daysPerYear = calculateDaysPerYear(conge, typeConge.isCompteWeekend());

        double totalJours = daysPerYear.values().stream().mapToDouble(Double::doubleValue).sum();

        if (totalJours <= 0) {
            throw new BusinessException("La durée du congé doit être supérieure à zéro");
        }

        for (Map.Entry<Integer, Double> entry : daysPerYear.entrySet()) {
            int annee = entry.getKey();
            double joursDansAnnee = entry.getValue();

            // Garantir que les soldes existent pour l'année demandée
            initialiserSoldesUtilisateur(employe.getId(), annee);

            double specificRestant = soldeCongeRepository
                    .findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeConge, annee)
                    .stream().findFirst()
                    .map(SoldeConge::getJoursRestants).orElse(0.0);

            double cpRestant = 0.0;
            // On ne cherche le CP que si le type actuel peut déborder et n'est pas déjà le
            // CP
            if (!"CP".equalsIgnoreCase(typeConge.getCode()) && typeConge.isPeutDeborderSurCP()) {
                TypeConge cpType = typeCongeRepository.findByCode("CP")
                        .or(() -> typeCongeRepository.findByCode("cp"))
                        .orElse(null);
                if (cpType != null) {
                    cpRestant = soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, cpType, annee)
                            .stream().findFirst()
                            .map(SoldeConge::getJoursRestants).orElse(0.0);
                }
            }

            if (specificRestant + cpRestant < joursDansAnnee) {
                throw new BusinessException(String.format(
                        "Quota insuffisant pour l'année %d. Il vous reste %.1f jours (%s) + %.1f jours (CP). " +
                                "Total disponible: %.1f j pour une demande de %.1f j.",
                        annee, specificRestant, typeConge.getNom(), cpRestant, (specificRestant + cpRestant),
                        joursDansAnnee));
            }
        }
        // Note: Si aucun solde n'est trouvé, on considère qu'il n'y a pas encore de
        // quota défini ou que c'est illimité (à affiner selon les besoins)

        conge.setNombreJours(totalJours);
        Conge saved = congeRepository.save(conge);

        publishLeaveEvent(LeaveEvent.EventType.CREATED, saved);

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

        StatutConge ancienStatut = conge.getStatut();
        conge.setStatut(nouveauStatut);
        conge.setValidateur(validateur);
        conge.setCommentaireValidation(request.getCommentaire());
        conge.setDateValidation(LocalDateTime.now());

        // Si approuvé, déduire du solde
        if (StatutConge.APPROUVE.equals(nouveauStatut)) {
            deduireDuSolde(conge);
        }

        Conge savedConge = congeRepository.save(conge);

        // Audit trail
        logStatutTransition(savedConge, ancienStatut, nouveauStatut, validateurEmail, request.getCommentaire());

        // Notifications
        LeaveEvent.EventType evtType = StatutConge.APPROUVE.equals(nouveauStatut)
            ? LeaveEvent.EventType.APPROVED
            : LeaveEvent.EventType.REJECTED;
        publishLeaveEvent(evtType, savedConge);

        log.info("Congé {} {} par {}", id, nouveauStatut, validateurEmail);

        return congeMapper.toDTO(savedConge);
    }

    private Map<Integer, Double> calculateDaysPerYear(Conge conge, boolean compteWeekend) {
        Map<Integer, Double> daysPerYear = new HashMap<>();
        Conge.DureeType dureeType = conge.getDureeType() != null ? conge.getDureeType()
                : Conge.DureeType.JOURNEE_ENTIERE;

        switch (dureeType) {
            case DEMI_JOUR_MATIN:
            case DEMI_JOUR_APRES_MIDI:
                ensureSameDay(conge.getDateDebut(), conge.getDateFin(), "Un congé demi-journée doit être sur une seule journée");
                daysPerYear.put(conge.getDateDebut().getYear(), 0.5);
                break;
            case PAR_HEURE:
                ensureSameDay(conge.getDateDebut(), conge.getDateFin(), "Un congé horaire doit être sur une seule journée");
                if (conge.getHeureDebut() == null || conge.getHeureFin() == null) {
                    throw new BusinessException("Les heures de début et fin sont obligatoires pour un congé horaire");
                }
                if (!conge.getHeureDebut().isBefore(conge.getHeureFin())) {
                    throw new BusinessException("L'heure de début doit être avant l'heure de fin");
                }
                double heures = Duration.between(conge.getHeureDebut(), conge.getHeureFin()).toMinutes() / 60.0;
                double jours = heures / workdayHours;
                if (jours <= 0) {
                    throw new BusinessException("La durée horaire doit être positive");
                }
                daysPerYear.put(conge.getDateDebut().getYear(), jours);
                break;
            case JOURNEE_ENTIERE:
            default:
                daysPerYear = calculateWorkingDays(conge.getDateDebut(), conge.getDateFin(), compteWeekend);
        }

        return daysPerYear;
    }

    private Map<Integer, Double> calculateWorkingDays(LocalDate debut, LocalDate fin, boolean compteWeekend) {
        Map<Integer, Double> daysPerYear = new HashMap<>();
        LocalDate current = debut;
        while (!current.isAfter(fin)) {
            int year = current.getYear();
            boolean isWorkingDay = true;
            if (!compteWeekend) {
                DayOfWeek dow = current.getDayOfWeek();
                if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                    isWorkingDay = false;
                }
                // Optionnel : Ajouter les jours fériés ici si nécessaire
            }

            if (isWorkingDay) {
                daysPerYear.put(year, daysPerYear.getOrDefault(year, 0.0) + 1.0);
            }
            current = current.plusDays(1);
        }
        return daysPerYear;
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

        Conge savedConge = congeRepository.save(conge);

        // Audit trail
        logStatutTransition(savedConge, ancienStatut, StatutConge.ANNULE, email, "Annulation par l'employé");

        publishLeaveEvent(LeaveEvent.EventType.CANCELLED, savedConge);

        log.info("Congé {} annulé", id);
        return congeMapper.toDTO(savedConge);
    }

    private void deduireDuSolde(Conge conge) {
        Map<Integer, Double> daysPerYear = calculateDaysPerYear(conge, conge.getType().isCompteWeekend());

        double totalTakenSpecific = 0.0;
        double totalTakenCP = 0.0;

        for (Map.Entry<Integer, Double> entry : daysPerYear.entrySet()) {
            int annee = entry.getKey();
            double joursADeduire = entry.getValue();

            // S'assurer que les soldes existent
            initialiserSoldesUtilisateur(conge.getEmploye().getId(), annee);

                // 1. Déduire du type spécifique avec verrou FOR UPDATE pour éviter les races
                SoldeConge soldeSpecifique = soldeCongeRepository
                    .findAllByUtilisateurAndTypeCongeAndAnneeForUpdate(conge.getEmploye().getId(),
                        conge.getType().getId(), annee)
                    .stream().findFirst()
                    .orElseThrow(() -> new BusinessException("Solde non trouvé pour l'année " + annee));

            double canTakeFromSpecific = soldeSpecifique.getJoursRestants();
            double takenFromSpecific = Math.min(canTakeFromSpecific, joursADeduire);

            soldeSpecifique.setJoursRestants(canTakeFromSpecific - takenFromSpecific);
            soldeCongeRepository.save(soldeSpecifique);

            totalTakenSpecific += takenFromSpecific;

            double resteADeduire = joursADeduire - takenFromSpecific;

            // 2. Si surplus ET autorisé, déduire du CP
            if (resteADeduire > 0 && conge.getType().isPeutDeborderSurCP()) {
                TypeConge typeCP = typeCongeRepository.findByCode("CP")
                        .or(() -> typeCongeRepository.findByCode("cp"))
                        .orElseThrow(() -> new BusinessException("Type congé CP non configuré ou introuvable"));

                com.fares.gestionrh.entity.SoldeConge soldeCP = soldeCongeRepository
                    .findAllByUtilisateurAndTypeCongeAndAnneeForUpdate(conge.getEmploye().getId(),
                        typeCP.getId(), annee)
                    .stream().findFirst()
                    .orElseThrow(() -> new BusinessException("Solde CP non trouvé pour l'année " + annee));

                if (soldeCP.getJoursRestants() < resteADeduire) {
                    throw new BusinessException("Solde CP insuffisant pour l'année " + annee);
                }

                soldeCP.setJoursRestants(soldeCP.getJoursRestants() - resteADeduire);
                soldeCongeRepository.save(soldeCP);

                totalTakenCP += resteADeduire;

                log.info("Déduction répartie année {}: {}j sur {}, {}j sur CP",
                        annee, takenFromSpecific, conge.getType().getCode(), resteADeduire);
            }
        }

        conge.setJoursDeductionSpecifique(totalTakenSpecific);
        conge.setJoursDeductionCP(totalTakenCP);
    }

    private void recrediterLeSolde(Conge conge) {
        Map<Integer, Double> daysPerYear = calculateDaysPerYear(conge, conge.getType().isCompteWeekend());

        double remainingSpecific = conge.getJoursDeductionSpecifique() != null ? conge.getJoursDeductionSpecifique()
                : 0.0;
        double remainingCP = conge.getJoursDeductionCP() != null ? conge.getJoursDeductionCP() : 0.0;

        for (Map.Entry<Integer, Double> entry : daysPerYear.entrySet()) {
            int annee = entry.getKey();
            double joursARecrediter = entry.getValue();

            // On recrédite d'abord le type spécifique (plus simple sans trace précise du
            // split d'origine)
            // car le quota spécifique est souvent plus restrictif.
                SoldeConge soldeSpecifique = soldeCongeRepository
                    .findAllByUtilisateurAndTypeCongeAndAnneeForUpdate(conge.getEmploye().getId(),
                        conge.getType().getId(), annee)
                    .stream().findFirst()
                    .orElse(null);

            if (soldeSpecifique != null) {
                double quotaMax = (double) soldeSpecifique.getTypeConge().getJoursParAn();
                double placeLibre = quotaMax - soldeSpecifique.getJoursRestants();
                double creditSpecificDemande = Math.min(remainingSpecific, joursARecrediter);
                double creditSpecific = Math.min(placeLibre, creditSpecificDemande);

                soldeSpecifique.setJoursRestants(soldeSpecifique.getJoursRestants() + creditSpecific);
                soldeCongeRepository.save(soldeSpecifique);

                remainingSpecific -= creditSpecific;

                double reste = joursARecrediter - creditSpecific;

                if (reste > 0 && remainingCP > 0) {
                    // Le reste va au CP mais plafonné par ce qui a été réellement déduit du CP
                    TypeConge typeCP = typeCongeRepository.findByCode("CP").orElse(null);
                    if (typeCP != null) {
                        SoldeConge soldeCP = soldeCongeRepository
                            .findAllByUtilisateurAndTypeCongeAndAnneeForUpdate(conge.getEmploye().getId(),
                                typeCP.getId(), annee)
                            .stream().findFirst()
                            .orElse(null);
                        if (soldeCP != null) {
                            double creditCP = Math.min(remainingCP, reste);
                            soldeCP.setJoursRestants(soldeCP.getJoursRestants() + creditCP);
                            soldeCongeRepository.save(soldeCP);
                            remainingCP -= creditCP;
                        }
                    }
                }
            }
        }
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
    public List<SoldeCongeResponse> getSoldesEmploye(Long employeId, String managerEmail) {
        Utilisateur manager = utilisateurRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", managerEmail));

        Utilisateur employe = utilisateurRepository.findById(employeId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", employeId));

        // Sécurité : Vérifier que le manager a le droit de consulter ce solde
        boolean isAdmin = manager.getRoles().contains(com.fares.gestionrh.entity.Role.ADMIN);
        boolean isRH = manager.getRoles().contains(com.fares.gestionrh.entity.Role.RH);

        if (!isAdmin && !isRH) {
            // Si c'est un manager, vérifier le département
            Long employeDeptId = employe.getDepartement() != null ? employe.getDepartement().getId() : null;
            Long managerDeptId = manager.getDepartement() != null ? manager.getDepartement().getId() : null;

            if (employeDeptId == null || !employeDeptId.equals(managerDeptId)) {
                throw new BusinessException(
                        "Accès refusé. Vous ne pouvez consulter que les soldes de votre département.");
            }
        }

        return soldeCongeRepository.findByUtilisateur(employe).stream()
                .map(this::mapToSoldeDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getSoldesDepartement(String managerEmail) {
        Utilisateur manager = utilisateurRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", managerEmail));

        boolean isAdmin = manager.getRoles().contains(com.fares.gestionrh.entity.Role.ADMIN);
        boolean isRH = manager.getRoles().contains(com.fares.gestionrh.entity.Role.RH);

        List<Utilisateur> employes;
        if (isAdmin || isRH) {
            // Admin/RH voient tous les employés
            employes = utilisateurRepository.findAll();
        } else if (manager.getDepartement() != null) {
            // Manager voit son département
            employes = utilisateurRepository.findByDepartement(manager.getDepartement());
        } else {
            return List.of();
        }

        return employes.stream()
                .map(emp -> {
                    java.util.Map<String, Object> data = new java.util.HashMap<>();
                    data.put("employeId", emp.getId());
                    data.put("employeNom", emp.getNomComplet());
                    data.put("employeEmail", emp.getEmail());
                    data.put("departement", emp.getDepartement() != null ? emp.getDepartement().getNom() : "N/A");

                    List<SoldeCongeResponse> soldes = soldeCongeRepository.findByUtilisateur(emp).stream()
                            .map(this::mapToSoldeDTO)
                            .collect(Collectors.toList());
                    data.put("soldes", soldes);

                    return data;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TypeConge> getAllTypes() {
        return typeCongeRepository.findAll();
    }

    /**
     * Initialise les soldes de congés pour un utilisateur pour l'année en cours
     * Crée automatiquement un solde pour chaque type de congé configuré
     */
    @Transactional
    public void initialiserSoldesUtilisateur(Long utilisateurId, int annee) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));

        List<TypeConge> types = typeCongeRepository.findAll();

        for (TypeConge type : types) {
            // Vérifier si le solde existe déjà (handle concurrency - may have duplicates temporarily)
            List<SoldeConge> existing = soldeCongeRepository
                    .findAllByUtilisateurAndTypeCongeAndAnnee(utilisateur, type, annee);

            if (existing.isEmpty()) {
                try {
                    SoldeConge solde = SoldeConge.builder()
                            .utilisateur(utilisateur)
                            .typeConge(type)
                            .annee(annee)
                            .joursRestants((double) type.getJoursParAn())
                            .build();
                    soldeCongeRepository.save(solde);
                    log.info("Solde créé pour {} - Type: {} - Année: {} - Jours: {}",
                            utilisateur.getEmail(), type.getNom(), annee, type.getJoursParAn());
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    // Race condition: another thread created it just now, ignore
                    // Clear the failed entity from the session to avoid Hibernate assertion errors
                    log.debug("Solde already exists for {} - Type: {} - Année: {}", 
                            utilisateur.getEmail(), type.getNom(), annee);
                }
            }
        }
    }

    /**
     * Initialise les soldes pour TOUS les utilisateurs pour l'année en cours
     * Utile pour l'initialisation du système ou le passage à une nouvelle année
     */
    @Transactional
    public java.util.Map<String, Object> initialiserTousLesSoldes(int annee) {
        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
        int compteurUtilisateurs = 0;
        int soldesCrees = 0;
        int soldesExistants = 0;

        for (Utilisateur utilisateur : utilisateurs) {
            List<TypeConge> types = typeCongeRepository.findAll();

            for (TypeConge type : types) {
                boolean exists = soldeCongeRepository
                        .findByUtilisateurAndTypeCongeAndAnnee(utilisateur, type, annee)
                        .isPresent();

                if (!exists) {
                    com.fares.gestionrh.entity.SoldeConge solde = com.fares.gestionrh.entity.SoldeConge.builder()
                            .utilisateur(utilisateur)
                            .typeConge(type)
                            .annee(annee)
                            .joursRestants((double) type.getJoursParAn())
                            .build();
                    soldeCongeRepository.save(solde);
                    soldesCrees++;
                    log.info("Solde créé pour {} - Type: {} - Année: {} - Jours: {}",
                            utilisateur.getEmail(), type.getNom(), annee, type.getJoursParAn());
                } else {
                    soldesExistants++;
                }
            }
            compteurUtilisateurs++;
        }

        log.info("Initialisation des soldes terminée : {} utilisateurs traités, {} soldes créés, {} déjà existants",
                compteurUtilisateurs, soldesCrees, soldesExistants);

        java.util.Map<String, Object> rapport = new java.util.HashMap<>();
        rapport.put("utilisateursTraites", compteurUtilisateurs);
        rapport.put("soldesCrees", soldesCrees);
        rapport.put("soldesExistants", soldesExistants);
        rapport.put("annee", annee);
        rapport.put("message",
                String.format("✅ %d soldes créés pour %d utilisateurs", soldesCrees, compteurUtilisateurs));

        return rapport;
    }

    private SoldeCongeResponse mapToSoldeDTO(com.fares.gestionrh.entity.SoldeConge solde) {
        return SoldeCongeResponse.builder()
                .id(solde.getId())
                .typeCongeNom(solde.getTypeConge().getNom())
                .typeCongeCode(solde.getTypeConge().getCode())
                .joursRestants(solde.getJoursRestants())
                .joursParAn(solde.getTypeConge().getJoursParAn())
                .annee(solde.getAnnee())
                .build();
    }

    private void validateDates(CongeRequest request, Conge.DureeType dureeType) {
        LocalDate debut = request.getDateDebut();
        LocalDate fin = request.getDateFin();

        if (debut == null || fin == null) {
            throw new BusinessException("Les dates sont obligatoires");
        }
        if (fin.isBefore(debut)) {
            throw new BusinessException("La date de fin doit être après la date de début");
        }
        if (debut.isBefore(LocalDate.now())) {
            throw new BusinessException("La date de début ne peut pas être dans le passé");
        }

        if (dureeType == Conge.DureeType.DEMI_JOUR_MATIN || dureeType == Conge.DureeType.DEMI_JOUR_APRES_MIDI) {
            ensureSameDay(debut, fin, "Un congé demi-journée doit être sur une seule journée");
        }

        if (dureeType == Conge.DureeType.PAR_HEURE) {
            ensureSameDay(debut, fin, "Un congé horaire doit être sur une seule journée");
            LocalTime hDebut = request.getHeureDebut();
            LocalTime hFin = request.getHeureFin();
            if (hDebut == null || hFin == null) {
                throw new BusinessException("Les heures de début et fin sont obligatoires pour un congé horaire");
            }
            if (!hDebut.isBefore(hFin)) {
                throw new BusinessException("L'heure de début doit être avant l'heure de fin");
            }
        }
    }

    private void ensureSameDay(LocalDate debut, LocalDate fin, String message) {
        if (debut == null || fin == null) {
            throw new BusinessException(message);
        }
        if (!debut.isEqual(fin)) {
            throw new BusinessException(message);
        }
    }

    private Conge.DureeType parseDureeType(String raw) {
        if (raw == null || raw.isBlank()) {
            return Conge.DureeType.JOURNEE_ENTIERE;
        }
        try {
            return Conge.DureeType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return Conge.DureeType.JOURNEE_ENTIERE;
        }
    }

    private void checkChevauchements(Long employeId, LocalDate debut, LocalDate fin) {
        List<Conge> chevauchements = congeRepository.findChevauchements(employeId, debut, fin);
        if (!chevauchements.isEmpty()) {
            throw new BusinessException("Chevauchement avec un congé existant");
        }
    }

    /**
     * Enregistre une transition de statut dans l'historique
     */
    private void logStatutTransition(Conge conge, StatutConge statutPrecedent, StatutConge statutNouveau,
                                     String acteur, String commentaire) {
        CongeHistorique historique = CongeHistorique.builder()
                .conge(conge)
                .statutPrecedent(statutPrecedent)
                .statutNouveau(statutNouveau)
                .acteur(acteur)
                .commentaire(commentaire)
                .build();
        congeHistoriqueRepository.save(historique);
        log.debug("Transition enregistrée: {} -> {} par {}", statutPrecedent, statutNouveau, acteur);
    }

    private void publishLeaveEvent(LeaveEvent.EventType type, Conge conge) {
        LeaveEvent event = LeaveEvent.builder()
                .type(type)
                .leaveId(conge.getId())
                .employeeName(conge.getEmploye() != null ? conge.getEmploye().getNomComplet() : null)
                .employeeEmail(conge.getEmploye() != null ? conge.getEmploye().getEmail() : null)
                .leaveType(conge.getType() != null ? conge.getType().getNom() : null)
                .leaveTypeCode(conge.getType() != null ? conge.getType().getCode() : null)
                .statutConge(conge.getStatut())
                .startDate(conge.getDateDebut())
                .endDate(conge.getDateFin())
                .durationDays(conge.getNombreJours())
                .createdAt(LocalDateTime.now())
                .build();
        eventPublisher.publishEvent(event);
    }

    public CongeStatsResponse getStatistics(CongeReportRequest request) {
        List<Conge> conges = filterConges(request);
        
        Map<String, Long> parStatut = conges.stream()
                .collect(Collectors.groupingBy(c -> c.getStatut().name(), Collectors.counting()));
        
        Map<String, Long> parType = conges.stream()
                .filter(c -> c.getType() != null)
                .collect(Collectors.groupingBy(c -> c.getType().getCode(), Collectors.counting()));
        
        Map<String, Double> joursParType = conges.stream()
                .filter(c -> c.getType() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getType().getCode(),
                        Collectors.summingDouble(Conge::getNombreJours)
                ));
        
        double totalJours = conges.stream()
                .filter(c -> StatutConge.APPROUVE.equals(c.getStatut()))
                .mapToDouble(Conge::getNombreJours)
                .sum();
        
        return CongeStatsResponse.builder()
                .totalDemandes(conges.size())
                .demandesEnAttente(parStatut.getOrDefault("EN_ATTENTE", 0L))
                .demandesApprouvees(parStatut.getOrDefault("APPROUVE", 0L))
                .demandesRejetees(parStatut.getOrDefault("REJETE", 0L))
                .demandesAnnulees(parStatut.getOrDefault("ANNULE", 0L))
                .totalJoursConsommes(totalJours)
                .parType(parType)
                .parStatut(parStatut)
                .joursParType(joursParType)
                .build();
    }

    public List<CongeResponse> getReport(CongeReportRequest request) {
        List<Conge> conges = filterConges(request);
        return conges.stream()
                .map(congeMapper::toDTO)
                .collect(Collectors.toList());
    }

    private List<Conge> filterConges(CongeReportRequest request) {
        List<Conge> conges = congeRepository.findAll();
        
        if (request.getDateDebut() != null && request.getDateFin() != null) {
            conges = conges.stream()
                    .filter(c -> !c.getDateDebut().isAfter(request.getDateFin()) 
                              && !c.getDateFin().isBefore(request.getDateDebut()))
                    .collect(Collectors.toList());
        }
        
        if (request.getTypeConge() != null && !request.getTypeConge().isBlank()) {
            conges = conges.stream()
                    .filter(c -> c.getType() != null 
                              && c.getType().getCode().equalsIgnoreCase(request.getTypeConge()))
                    .collect(Collectors.toList());
        }
        
        if (request.getStatut() != null && !request.getStatut().isBlank()) {
            try {
                StatutConge statut = StatutConge.valueOf(request.getStatut().toUpperCase());
                conges = conges.stream()
                        .filter(c -> c.getStatut() == statut)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}", request.getStatut());
            }
        }
        
        if (request.getDepartementId() != null) {
            conges = conges.stream()
                    .filter(c -> c.getEmploye() != null 
                              && c.getEmploye().getDepartement() != null
                              && c.getEmploye().getDepartement().getId().equals(request.getDepartementId()))
                    .collect(Collectors.toList());
        }
        
        if (request.getEmployeId() != null) {
            conges = conges.stream()
                    .filter(c -> c.getEmploye() != null 
                              && c.getEmploye().getId().equals(request.getEmployeId()))
                    .collect(Collectors.toList());
        }
        
        return conges;
    }

    /**
     * Récupère l'historique complet d'une demande de congé avec vérification des permissions
     * 
     * @param congeId ID de la demande de congé
     * @param email Email de l'utilisateur demandeur
     * @return Liste des entrées d'historique (triée chronologiquement décroissante)
     * @throws ResourceNotFoundException si le congé n'existe pas
     * @throws BusinessException si l'utilisateur n'a pas accès à cet historique
     */
    @Transactional(readOnly = true)
    public List<com.fares.gestionrh.dto.conge.CongeHistoriqueDTO> getHistorique(Long congeId, String email) {
        // Récupérer le congé
        Conge conge = congeRepository.findById(congeId)
                .orElseThrow(() -> new ResourceNotFoundException("Conge", "id", congeId));
        
        // Récupérer l'utilisateur demandeur
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));
        
        // Vérifier les permissions
        boolean isAdmin = utilisateur.getRoles().contains(com.fares.gestionrh.entity.Role.ADMIN);
        boolean isRH = utilisateur.getRoles().contains(com.fares.gestionrh.entity.Role.RH);
        
        if (!isAdmin && !isRH) {
            // Un employé ne peut voir que ses propres congés
            if (!conge.getEmploye().getId().equals(utilisateur.getId())) {
                // Un manager peut voir les congés de son département
                boolean isManager = utilisateur.getRoles().contains(com.fares.gestionrh.entity.Role.MANAGER);
                if (isManager) {
                    Long managerDeptId = utilisateur.getDepartement() != null 
                        ? utilisateur.getDepartement().getId() 
                        : null;
                    Long employeDeptId = conge.getEmploye().getDepartement() != null 
                        ? conge.getEmploye().getDepartement().getId() 
                        : null;
                    
                    if (managerDeptId == null || !managerDeptId.equals(employeDeptId)) {
                        throw new BusinessException("Accès refusé. Vous ne pouvez consulter que les congés de votre département.");
                    }
                } else {
                    throw new BusinessException("Accès refusé. Vous ne pouvez consulter que vos propres congés.");
                }
            }
        }
        
        // Récupérer l'historique
        List<CongeHistorique> historique = congeHistoriqueRepository
                .findByCongeIdOrderByDateModificationDesc(congeId);
        
        // Convertir en DTO
        return historique.stream()
                .map(this::toCongeHistoriqueDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convertit une entité CongeHistorique en DTO
     */
    private com.fares.gestionrh.dto.conge.CongeHistoriqueDTO toCongeHistoriqueDTO(CongeHistorique historique) {
        // Récupérer l'utilisateur qui a effectué l'action
        Utilisateur acteur = utilisateurRepository.findByEmail(historique.getActeur()).orElse(null);
        String acteurNom = (acteur != null) 
            ? acteur.getPrenom() + " " + acteur.getNom()
            : historique.getActeur();
        
        return com.fares.gestionrh.dto.conge.CongeHistoriqueDTO.builder()
                .id(historique.getId())
                .statutPrecedent(historique.getStatutPrecedent())
                .statutNouveau(historique.getStatutNouveau())
                .acteur(historique.getActeur())
                .acteurNom(acteurNom)
                .dateModification(historique.getDateModification())
                .commentaire(historique.getCommentaire())
                .build();
    }
}