package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.departement.CreateDepartementRequest;
import com.fares.gestionrh.dto.departement.DepartementDTO;
import com.fares.gestionrh.dto.departement.UpdateDepartementRequest;

import com.fares.gestionrh.entity.Departement;
import com.fares.gestionrh.exception.ConflictException;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.DepartementMapper;
import com.fares.gestionrh.repository.DepartementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartementService {

    private final DepartementRepository departementRepository;
    private final DepartementMapper departementMapper;

    @Transactional
    public DepartementDTO createDepartement(CreateDepartementRequest request) {
        if (departementRepository.existsByNom(request.getNom())) {
            throw new ConflictException("Un département avec ce nom existe déjà");
        }

        Departement departement = departementMapper.toEntity(request);
        return departementMapper.toDTO(departementRepository.save(departement));
    }

    @Transactional(readOnly = true)
    public List<DepartementDTO> getAllDepartements() {
        return departementRepository.findAll().stream()
                .map(departementMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartementDTO getDepartementById(Long id) {
        Departement departement = departementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Département", "id", id));
        return departementMapper.toDTO(departement);
    }

    @Transactional
    public DepartementDTO updateDepartement(Long id, UpdateDepartementRequest request) {
        Departement departement = departementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Département", "id", id));

        if (request.getNom() != null && !departement.getNom().equals(request.getNom()) &&
                departementRepository.existsByNom(request.getNom())) {
            throw new ConflictException("Un département avec ce nom existe déjà");
        }

        departementMapper.updateEntity(departement, request);

        return departementMapper.toDTO(departementRepository.save(departement));
    }

    @Transactional
    public void deleteDepartement(Long id) {
        if (!departementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Département", "id", id);
        }
        departementRepository.deleteById(id);
    }
}
