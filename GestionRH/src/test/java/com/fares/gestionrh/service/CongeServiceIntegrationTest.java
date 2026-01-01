package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.conge.CongeRequest;
import com.fares.gestionrh.dto.conge.ValidationCongeRequest;
import com.fares.gestionrh.entity.*;
import com.fares.gestionrh.exception.BusinessException;
import com.fares.gestionrh.repository.CongeRepository;
import com.fares.gestionrh.repository.CongeHistoriqueRepository;
import com.fares.gestionrh.repository.DepartementRepository;
import com.fares.gestionrh.repository.AffectationHistoryRepository;
import com.fares.gestionrh.repository.PosteRepository;
import com.fares.gestionrh.repository.SoldeCongeRepository;
import com.fares.gestionrh.repository.TypeCongeRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CongeServiceIntegrationTest {

    @Autowired
    private CongeService congeService;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private TypeCongeRepository typeCongeRepository;
    @Autowired
    private SoldeCongeRepository soldeCongeRepository;
    @Autowired
    private CongeRepository congeRepository;
    @Autowired
    private CongeHistoriqueRepository congeHistoriqueRepository;
        @Autowired
        private DepartementRepository departementRepository;
        @Autowired
        private PosteRepository posteRepository;
        @Autowired
        private AffectationHistoryRepository affectationHistoryRepository;

    private Utilisateur employe;
    private Utilisateur admin;
    private TypeConge typeForm;
    private TypeConge typeCP;

    @BeforeEach
    void setup() {
        // Nettoyage TRÈS complet (base MySQL persistante entre runs)
        // Force delete to handle duplicates
        // First, delete any orphaned duplicates that violate unique constraint
        affectationHistoryRepository.deleteAll();
        affectationHistoryRepository.flush();
        congeHistoriqueRepository.deleteAll();
        congeHistoriqueRepository.flush(); // Delete history before conges due to FK constraint
        congeRepository.deleteAll();
        congeRepository.flush();
        soldeCongeRepository.deleteAll();
        soldeCongeRepository.flush();
        typeCongeRepository.deleteAll();
        typeCongeRepository.flush();

                // Détacher les managers pour éviter les contraintes lors de la suppression des utilisateurs
                var departements = departementRepository.findAll();
                if (!departements.isEmpty()) {
                        departements.forEach(d -> d.setManager(null));
                        departementRepository.saveAll(departements);
                        departementRepository.flush();
                }

                utilisateurRepository.deleteAll();
                utilisateurRepository.flush();
                posteRepository.deleteAll();
                posteRepository.flush();
                departementRepository.deleteAll();
                departementRepository.flush();

        String suffix = String.valueOf(System.nanoTime());

        // Utilisateur employé
        employe = Utilisateur.builder()
                .email("emp+" + suffix + "@example.com")
                .motDePasse("pwd")
                .nom("Emp")
                .prenom("Test")
                .roles(Set.of(Role.EMPLOYE))
                .actif(true)
                .dateCreation(LocalDateTime.now())
                .build();
        employe = utilisateurRepository.save(employe);

        // Utilisateur admin pour valider
        admin = Utilisateur.builder()
                .email("admin+" + suffix + "@example.com")
                .motDePasse("pwd")
                .nom("Admin")
                .prenom("Test")
                .roles(Set.of(Role.ADMIN))
                .actif(true)
                .dateCreation(LocalDateTime.now())
                .build();
        admin = utilisateurRepository.save(admin);

        // Types de congé
        typeCP = typeCongeRepository.save(TypeConge.builder()
                .code("CP")
                .nom("Congé Payé")
                .joursParAn(10)
                .compteWeekend(true)
                .peutDeborderSurCP(false)
                .build());

        typeForm = typeCongeRepository.save(TypeConge.builder()
                .code("FORM")
                .nom("Formation")
                .joursParAn(3)
                .compteWeekend(true)
                .peutDeborderSurCP(true)
                .build());

        // Les soldes seront créés automatiquement par initialiserSoldesUtilisateur() lors de creerDemande()
        // avec les valeurs joursParAn définies ci-dessus (CP=10, FORM=3)
    }

    @Test
    @DisplayName("Création multi-années avec overflow CP : soldes jamais négatifs")
    void multiYearOverflowDoesNotGoNegative() {
        // 29/12/2026 -> 05/01/2027 (8 jours calendaires, compteWeekend=true)
        CongeRequest req = CongeRequest.builder()
                .dateDebut(LocalDate.of(2026, 12, 29))
                .dateFin(LocalDate.of(2027, 1, 5))
                .type("FORM")
                .motif("Formation longue")
                .build();

        // Création (statut EN_ATTENTE)
        var created = congeService.creerDemande(req, employe.getEmail());
        Conge conge = congeRepository.findById(created.getId()).orElseThrow();

        // Validation → déduction (3 jours en 2026 uses 3.0 FORM exactly, 5 jours en 2027 uses 3.0 FORM + 2.0 CP overflow)
        ValidationCongeRequest valReq = ValidationCongeRequest.builder()
                .statut("APPROUVE")
                .commentaire("ok")
                .build();
        congeService.validerDemande(conge.getId(), valReq, admin.getEmail());

        Map<Integer, Double> restantForm = soldeCongeRepository.findByUtilisateur(employe).stream()
                .filter(s -> s.getTypeConge().getCode().equals("FORM"))
                .collect(java.util.stream.Collectors.toMap(SoldeConge::getAnnee, SoldeConge::getJoursRestants));
        Map<Integer, Double> restantCP = soldeCongeRepository.findByUtilisateur(employe).stream()
                .filter(s -> s.getTypeConge().getCode().equals("CP"))
                .collect(java.util.stream.Collectors.toMap(SoldeConge::getAnnee, SoldeConge::getJoursRestants));

        // 2026: Started with FORM=3.0, deducted 3.0 → leaves 0.0, no CP overflow needed
        assertThat(restantForm.get(2026)).isEqualTo(0.0);
        assertThat(restantCP.get(2026)).isEqualTo(10.0);
        // 2027: Started with FORM=3.0, deducted 3.0 → leaves 0.0; CP overflow for 2 days → CP leaves 8.0
        assertThat(restantForm.get(2027)).isEqualTo(0.0);
        assertThat(restantCP.get(2027)).isEqualTo(8.0);
    }

    @Test
    @DisplayName("Annulation après approbation recrédite exactement le split")
    void cancelRestoresExactSplit() {
        // Demande 5j (2026/12/29-2027/01/02): 3 days in 2026, 2 days in 2027
        // Started with: 2026 FORM=3.0, 2027 FORM=3.0
        // Deduction: 2026 uses 3.0 FORM → 2027 uses 2.0 FORM
        CongeRequest req = CongeRequest.builder()
                .dateDebut(LocalDate.of(2026, 12, 29))
                .dateFin(LocalDate.of(2027, 1, 2))
                .type("FORM")
                .motif("Formation")
                .build();
        var created = congeService.creerDemande(req, employe.getEmail());
        var valReq = ValidationCongeRequest.builder().statut("APPROUVE").commentaire("ok").build();
        congeService.validerDemande(created.getId(), valReq, admin.getEmail());

        // Soldes après approbation: 2026 (3.0 FORM deducted → 0.0 remains), 2027 (2.0 FORM deducted → 1.0 remains)
        double form2026After = soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeForm, 2026).stream().findFirst().orElseThrow().getJoursRestants();
        double cp2026After = soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeCP, 2026).stream().findFirst().orElseThrow().getJoursRestants();
        double form2027After = soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeForm, 2027).stream().findFirst().orElseThrow().getJoursRestants();
        double cp2027After = soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeCP, 2027).stream().findFirst().orElseThrow().getJoursRestants();

        assertThat(form2026After).isEqualTo(0.0);
        assertThat(cp2026After).isEqualTo(10.0);
        assertThat(form2027After).isEqualTo(1.0);
        assertThat(cp2027After).isEqualTo(10.0);

        // Annulation → should restore to initial values (3.0 FORM for both years)
        congeService.annulerDemande(created.getId(), employe.getEmail());

        // Soldes restaurés to initial joursParAn values
        assertThat(soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeForm, 2026).stream().findFirst().orElseThrow().getJoursRestants())
                .isEqualTo(3.0);
        assertThat(soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeCP, 2026).stream().findFirst().orElseThrow().getJoursRestants())
                .isEqualTo(10.0);
        assertThat(soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeForm, 2027).stream().findFirst().orElseThrow().getJoursRestants())
                .isEqualTo(3.0);
        assertThat(soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeCP, 2027).stream().findFirst().orElseThrow().getJoursRestants())
                .isEqualTo(10.0);
    }

    @Test
    @DisplayName("Refus de création si dateDebut passée")
    void rejectPastStartDate() {
        CongeRequest req = CongeRequest.builder()
                .dateDebut(LocalDate.now().minusDays(1))
                .dateFin(LocalDate.now())
                .type("FORM")
                .motif("Invalid")
                .build();

        assertThatThrownBy(() -> congeService.creerDemande(req, employe.getEmail()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ne peut pas être dans le passé");
    }

    @Test
    @Disabled("TODO: Fix Hibernate session issue in concurrent scenario")
    @DisplayName("Concurrence: deux validations simultanées ne produisent pas de solde négatif")
    void concurrentApprovalsStayNonNegative() throws Exception {
        // Soldes serrés : FORM=2, CP=1 pour 2025
        soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeForm, 2025).stream().findFirst().ifPresent(s -> {
            s.setJoursRestants(2.0);
            soldeCongeRepository.save(s);
        });
        soldeCongeRepository.findAllByUtilisateurAndTypeCongeAndAnnee(employe, typeCP, 2025).stream().findFirst().ifPresent(s -> {
            s.setJoursRestants(1.0);
            soldeCongeRepository.save(s);
        });

        // Deux demandes distinctes (pas de chevauchement)
        Conge c1 = congeRepository.save(Conge.builder()
                .dateDebut(LocalDate.of(2025, 1, 2))
                .dateFin(LocalDate.of(2025, 1, 3))
                .type(typeForm)
                .employe(employe)
                .statut(StatutConge.EN_ATTENTE)
                .nombreJours(2.0)
                .build());
        Conge c2 = congeRepository.save(Conge.builder()
                .dateDebut(LocalDate.of(2025, 1, 6))
                .dateFin(LocalDate.of(2025, 1, 7))
                .type(typeForm)
                .employe(employe)
                .statut(StatutConge.EN_ATTENTE)
                .nombreJours(2.0)
                .build());

        ValidationCongeRequest valReq = ValidationCongeRequest.builder().statut("APPROUVE").commentaire("ok").build();
        CountDownLatch start = new CountDownLatch(1);
        var exec = Executors.newFixedThreadPool(2);

        Future<?> f1 = exec.submit(() -> {
            await(start);
            congeService.validerDemande(c1.getId(), valReq, admin.getEmail());
        });
        Future<?> f2 = exec.submit(() -> {
            await(start);
            congeService.validerDemande(c2.getId(), valReq, admin.getEmail());
        });

        start.countDown();
        f1.get();
        f2.get();
        exec.shutdown();

        List<SoldeConge> soldes = soldeCongeRepository.findByUtilisateur(employe);
        soldes.forEach(s -> assertThat(s.getJoursRestants()).isGreaterThanOrEqualTo(0.0));
    }

    @Test
    @DisplayName("Audit trail: should log status transitions on validate and cancel")
    @Transactional
    void shouldLogStatusTransitionsInHistory() throws Exception {
        // This test uses the existing setup() data (employe, admin, typeCP)
        // Create leave request
        CongeRequest req = CongeRequest.builder()
                .type(typeCP.getCode())
                .dateDebut(LocalDate.now().plusDays(10))
                .dateFin(LocalDate.now().plusDays(12))
                .motif("Test audit trail")
                .build();
        var response = congeService.creerDemande(req, employe.getEmail());
        Long congeId = response.getId();

        // Validate (EN_ATTENTE → APPROUVE)
        ValidationCongeRequest valReq = ValidationCongeRequest.builder()
                .statut("APPROUVE")
                .commentaire("Validation RH")
                .build();
        congeService.validerDemande(congeId, valReq, admin.getEmail());

        // Cancel (APPROUVE → ANNULE)
        congeService.annulerDemande(congeId, employe.getEmail());

        // Verify history
        List<CongeHistorique> history = congeHistoriqueRepository.findByCongeIdOrderByDateModificationDesc(congeId);
        assertThat(history).hasSize(2);

        // First transition: EN_ATTENTE → APPROUVE (second in desc order)
        CongeHistorique firstTransition = history.get(1);
        assertThat(firstTransition.getStatutPrecedent()).isEqualTo(StatutConge.EN_ATTENTE);
        assertThat(firstTransition.getStatutNouveau()).isEqualTo(StatutConge.APPROUVE);
        assertThat(firstTransition.getActeur()).isEqualTo(admin.getEmail());
        assertThat(firstTransition.getCommentaire()).isEqualTo("Validation RH");

        // Second transition: APPROUVE → ANNULE (first in desc order)
        CongeHistorique secondTransition = history.get(0);
        assertThat(secondTransition.getStatutPrecedent()).isEqualTo(StatutConge.APPROUVE);
        assertThat(secondTransition.getStatutNouveau()).isEqualTo(StatutConge.ANNULE);
        assertThat(secondTransition.getActeur()).isEqualTo(employe.getEmail());
        assertThat(secondTransition.getCommentaire()).contains("Annulation");
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
