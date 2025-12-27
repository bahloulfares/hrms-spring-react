package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.poste.CreatePosteRequest;
import com.fares.gestionrh.dto.poste.PosteDTO;
import com.fares.gestionrh.dto.poste.UpdatePosteRequest;

import com.fares.gestionrh.entity.Poste;
import com.fares.gestionrh.exception.ResourceNotFoundException;
import com.fares.gestionrh.mapper.PosteMapper;
import com.fares.gestionrh.repository.PosteRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosteService {

    private final PosteRepository posteRepository;
    private final PosteMapper posteMapper;

    @Transactional
    public PosteDTO createPoste(CreatePosteRequest request) {
        Poste poste = posteMapper.toEntity(request);
        return posteMapper.toDTO(posteRepository.save(poste));
    }

    @Transactional(readOnly = true)
    public List<PosteDTO> getAllPostes() {
        return posteRepository.findAll().stream()
                .map(posteMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PosteDTO> getPostesByDepartement(Long departementId) {
        return posteRepository.findByDepartementId(departementId).stream()
                .map(posteMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PosteDTO getPosteById(Long id) {
        Poste poste = posteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poste", "id", id));
        return posteMapper.toDTO(poste);
    }

    @Transactional
    public PosteDTO updatePoste(Long id, UpdatePosteRequest request) {
        Poste poste = posteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poste", "id", id));

        posteMapper.updateEntity(poste, request);

        return posteMapper.toDTO(posteRepository.save(poste));
    }

    @Transactional
    public void deletePoste(Long id) {
        if (!posteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Poste", "id", id);
        }
        posteRepository.deleteById(id);
    }
}
