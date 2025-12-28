package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.utilisateur.CreateUtilisateurRequest;
import com.fares.gestionrh.dto.utilisateur.UtilisateurDTO;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.exception.ConflictException;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.UtilisateurMapper;
import com.fares.gestionrh.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.fares.gestionrh.entity.AffectationHistory;
import com.fares.gestionrh.repository.AffectationHistoryRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final PasswordEncoder passwordEncoder;
    private final AffectationHistoryRepository historyRepository;

    @Transactional

    public UtilisateurDTO creerUtilisateur(CreateUtilisateurRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email déjà utilisé");
        }

        Utilisateur utilisateur = utilisateurMapper.toEntity(request);
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));

        return utilisateurMapper.toDTO(utilisateurRepository.save(utilisateur));
    }

    @Transactional(readOnly = true)
    public List<UtilisateurDTO> getAllUtilisateurs() {
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
