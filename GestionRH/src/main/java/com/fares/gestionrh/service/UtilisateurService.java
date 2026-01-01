package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.utilisateur.CreateUtilisateurRequest;
import com.fares.gestionrh.dto.utilisateur.UtilisateurDTO;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.exception.ConflictException;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.UtilisateurMapper;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fares.gestionrh.entity.AffectationHistory;
import com.fares.gestionrh.repository.AffectationHistoryRepository;

import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final PasswordEncoder passwordEncoder;
    private final AffectationHistoryRepository historyRepository;
    private final com.fares.gestionrh.service.CongeService congeService;

    @Transactional
    public UtilisateurDTO creerUtilisateur(CreateUtilisateurRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email déjà utilisé");
        }

        Utilisateur utilisateur = utilisateurMapper.toEntity(request);
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));

        Utilisateur savedUser = utilisateurRepository.save(utilisateur);

        // Initialiser automatiquement les soldes de congés pour le nouvel employé
        try {
            int anneeActuelle = java.time.LocalDate.now().getYear();
            congeService.initialiserSoldesUtilisateur(savedUser.getId(), anneeActuelle);
            log.info("Soldes de congés initialisés automatiquement pour le nouvel utilisateur: {}",
                    savedUser.getEmail());
        } catch (Exception e) {
            log.warn("Erreur lors de l'initialisation des soldes pour {}: {}", savedUser.getEmail(), e.getMessage());
        }

        return utilisateurMapper.toDTO(savedUser);
    }

    /**
     * Récupère tous les utilisateurs avec pagination et tri
     *
     * @param pageable Paramètres de pagination et tri
     * @return Page d'utilisateurs
     */
    @Transactional(readOnly = true)
    public Page<UtilisateurDTO> getAllUtilisateurs(Pageable pageable) {
        return utilisateurRepository.findAll(pageable)
                .map(utilisateurMapper::toDTO);
    }

    /**
     * Récupère tous les utilisateurs (sans pagination - legacy)
     * À utiliser avec prudence sur de grandes données
     *
     * @return Liste complète d'utilisateurs
     */
    @Transactional(readOnly = true)
    public List<UtilisateurDTO> getAllUtilisateurs() {
        log.warn("getAllUtilisateurs sans pagination appelé - utilisez getAllUtilisateurs(Pageable) pour les listes volumineuses");
        return utilisateurRepository.findAll().stream()
                .map(utilisateurMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UtilisateurDTO getUtilisateurById(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));
        return utilisateurMapper.toDTO(utilisateur);
    }

    @Transactional
    public void deleteUtilisateur(Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur", "id", id);
        }
        utilisateurRepository.deleteById(id);
    }

    @Transactional
    public UtilisateurDTO updateUtilisateur(Long id,
            com.fares.gestionrh.dto.utilisateur.UpdateUtilisateurRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));

        if (request.getEmail() != null && !request.getEmail().equals(utilisateur.getEmail()) &&
                utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email déjà utilisé");
        }

        // Sauvegarder les anciennes valeurs pour l'historique
        String oldDept = utilisateur.getDepartement() != null ? utilisateur.getDepartement().getNom() : null;
        String oldPoste = utilisateur.getPoste() != null ? utilisateur.getPoste().getTitre() : null;

        // Utiliser le mapper pour tous les champs (y compris poste et département)
        utilisateurMapper.updateEntity(utilisateur, request);

        // Récupérer les nouvelles valeurs après mapping
        String newDept = utilisateur.getDepartement() != null ? utilisateur.getDepartement().getNom() : null;
        String newPoste = utilisateur.getPoste() != null ? utilisateur.getPoste().getTitre() : null;

        // Si changement, enregistrer dans l'historique
        boolean deptChanged = (oldDept == null && newDept != null) || (oldDept != null && !oldDept.equals(newDept));
        boolean posteChanged = (oldPoste == null && newPoste != null)
                || (oldPoste != null && !oldPoste.equals(newPoste));

        if (deptChanged || posteChanged) {
            String modifiePar = SecurityContextHolder.getContext().getAuthentication().getName();
            AffectationHistory history = AffectationHistory.builder()
                    .utilisateur(utilisateur)
                    .oldDepartement(oldDept)
                    .newDepartement(newDept)
                    .oldPoste(oldPoste)
                    .newPoste(newPoste)
                    .modifiePar(modifiePar)
                    .build();
            historyRepository.save(history);
        }

        // Gérer le mot de passe si présent (car non géré par le mapper)
        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        return utilisateurMapper.toDTO(utilisateurRepository.save(utilisateur));
    }
}
