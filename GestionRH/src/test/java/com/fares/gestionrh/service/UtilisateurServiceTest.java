package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.utilisateur.CreateUtilisateurRequest;
import com.fares.gestionrh.dto.utilisateur.UtilisateurDTO;
import com.fares.gestionrh.entity.Departement;
import com.fares.gestionrh.entity.Poste;
import com.fares.gestionrh.entity.Role;
import com.fares.gestionrh.entity.Utilisateur;
import com.fares.gestionrh.exception.ConflictException;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.UtilisateurMapper;
import com.fares.gestionrh.repository.AffectationHistoryRepository;
import com.fares.gestionrh.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour UtilisateurService
 * 
 * Couvre:
 * - Création d'utilisateurs
 * - Récupération (par ID, liste)
 * - Modification
 * - Suppression
 * - Gestion des exceptions
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires - UtilisateurService")
class UtilisateurServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private UtilisateurMapper utilisateurMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AffectationHistoryRepository historyRepository;

    @Mock
    private CongeService congeService;

    @InjectMocks
    private UtilisateurService utilisateurService;

    private Utilisateur testUtilisateur;
    private UtilisateurDTO testDTO;
    private CreateUtilisateurRequest createRequest;

    @BeforeEach
    void setUp() {
        // Préparation des données de test
        testUtilisateur = Utilisateur.builder()
                .id(1L)
                .email("test@example.com")
                .motDePasse("hashed_password")
                .nom("Dupont")
                .prenom("Jean")
                .telephone("06 12 34 56 78")
                .actif(true)
                .roles(new HashSet<>(Collections.singletonList(Role.EMPLOYE)))
                .dateCreation(LocalDateTime.now())
                .build();

        testDTO = new UtilisateurDTO();
        testDTO.setId(1L);
        testDTO.setEmail("test@example.com");
        testDTO.setNom("Dupont");
        testDTO.setPrenom("Jean");

        createRequest = new CreateUtilisateurRequest();
        createRequest.setEmail("newuser@example.com");
        createRequest.setMotDePasse("password123");
        createRequest.setNom("Martin");
        createRequest.setPrenom("Pierre");
    }

    // ========================================
    // TESTS: creerUtilisateur
    // ========================================

    @Test
    @DisplayName("Créer un utilisateur avec succès")
    void testCreerUtilisateurSuccess() {
        // Arrange
        when(utilisateurRepository.existsByEmail(createRequest.getEmail())).thenReturn(false);
        when(utilisateurMapper.toEntity(createRequest)).thenReturn(testUtilisateur);
        when(passwordEncoder.encode(createRequest.getMotDePasse())).thenReturn("hashed_password");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenReturn(testUtilisateur);
        when(utilisateurMapper.toDTO(testUtilisateur)).thenReturn(testDTO);
        doNothing().when(congeService).initialiserSoldesUtilisateur(anyLong(), anyInt());

        // Act
        UtilisateurDTO result = utilisateurService.creerUtilisateur(createRequest);

        // Assert
        assertNotNull(result);
        assertEquals(testDTO.getEmail(), result.getEmail());
        verify(utilisateurRepository, times(1)).save(any(Utilisateur.class));
        verify(passwordEncoder, times(1)).encode(createRequest.getMotDePasse());
    }

    @Test
    @DisplayName("Échouer si l'email existe déjà")
    void testCreerUtilisateurEmailExists() {
        // Arrange
        when(utilisateurRepository.existsByEmail(createRequest.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> {
            utilisateurService.creerUtilisateur(createRequest);
        });

        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    // ========================================
    // TESTS: getAllUtilisateurs (avec pagination)
    // ========================================

    @Test
    @DisplayName("Récupérer la liste paginée des utilisateurs")
    void testGetAllUtilisateursPaginated() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Utilisateur> page = new PageImpl<>(Collections.singletonList(testUtilisateur), pageable, 1);

        when(utilisateurRepository.findAll(pageable)).thenReturn(page);
        when(utilisateurMapper.toDTO(testUtilisateur)).thenReturn(testDTO);

        // Act
        Page<UtilisateurDTO> result = utilisateurService.getAllUtilisateurs(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals(testDTO.getEmail(), result.getContent().get(0).getEmail());
        verify(utilisateurRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Récupérer liste vide quand pas d'utilisateurs")
    void testGetAllUtilisateurEmptyList() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Utilisateur> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(utilisateurRepository.findAll(pageable)).thenReturn(emptyPage);

        // Act
        Page<UtilisateurDTO> result = utilisateurService.getAllUtilisateurs(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    // ========================================
    // TESTS: getUtilisateurById
    // ========================================

    @Test
    @DisplayName("Récupérer un utilisateur par ID avec succès")
    void testGetUtilisateurByIdSuccess() {
        // Arrange
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(testUtilisateur));
        when(utilisateurMapper.toDTO(testUtilisateur)).thenReturn(testDTO);

        // Act
        UtilisateurDTO result = utilisateurService.getUtilisateurById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testDTO.getEmail(), result.getEmail());
        verify(utilisateurRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Lancer ResourceNotFoundException si utilisateur n'existe pas")
    void testGetUtilisateurByIdNotFound() {
        // Arrange
        when(utilisateurRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            utilisateurService.getUtilisateurById(999L);
        });

        verify(utilisateurRepository, times(1)).findById(999L);
    }

    // ========================================
    // TESTS: deleteUtilisateur
    // ========================================

    @Test
    @DisplayName("Supprimer un utilisateur avec succès")
    void testDeleteUtilisateurSuccess() {
        // Arrange
        when(utilisateurRepository.existsById(1L)).thenReturn(true);
        doNothing().when(utilisateurRepository).deleteById(1L);

        // Act
        utilisateurService.deleteUtilisateur(1L);

        // Assert
        verify(utilisateurRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Échouer si on essaie de supprimer un utilisateur inexistant")
    void testDeleteUtilisateurNotFound() {
        // Arrange
        when(utilisateurRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            utilisateurService.deleteUtilisateur(999L);
        });

        verify(utilisateurRepository, never()).deleteById(999L);
    }

    // ========================================
    // TESTS: updateUtilisateur
    // ========================================

    @Test
    @DisplayName("Modifier un utilisateur avec succès")
    void testUpdateUtilisateurSuccess() {
        // Arrange
        var updateRequest = new com.fares.gestionrh.dto.utilisateur.UpdateUtilisateurRequest();
        updateRequest.setNom("DupontModifié");
        updateRequest.setEmail("newemail@example.com");

        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(testUtilisateur));
        when(utilisateurRepository.existsByEmail("newemail@example.com")).thenReturn(false);
        doNothing().when(utilisateurMapper).updateEntity(any(Utilisateur.class), any());
        when(utilisateurRepository.save(any(Utilisateur.class))).thenReturn(testUtilisateur);
        when(utilisateurMapper.toDTO(testUtilisateur)).thenReturn(testDTO);

        // Act
        UtilisateurDTO result = utilisateurService.updateUtilisateur(1L, updateRequest);

        // Assert
        assertNotNull(result);
        verify(utilisateurRepository, times(1)).save(any(Utilisateur.class));
        verify(utilisateurMapper, times(1)).updateEntity(any(Utilisateur.class), any());
    }

    @Test
    @DisplayName("Échouer si l'email à mettre à jour existe déjà")
    void testUpdateUtilisateurEmailExists() {
        // Arrange
        var updateRequest = new com.fares.gestionrh.dto.utilisateur.UpdateUtilisateurRequest();
        updateRequest.setEmail("existing@example.com");

        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(testUtilisateur));
        when(utilisateurRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> {
            utilisateurService.updateUtilisateur(1L, updateRequest);
        });

        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }
}
