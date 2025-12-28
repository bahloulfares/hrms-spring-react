package com.fares.gestionrh.service;

import com.fares.gestionrh.entity.TypeConge;
import com.fares.gestionrh.repository.TypeCongeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TypeCongeService {

    private final TypeCongeRepository typeCongeRepository;

    public List<TypeConge> getAllTypes() {
        return typeCongeRepository.findAll();
    }

    @Transactional
    public TypeConge createType(TypeConge typeConge) {
        if (typeCongeRepository.findByCode(typeConge.getCode()).isPresent()) {
            throw new RuntimeException("Un type avec ce code existe déjà");
        }
        return typeCongeRepository.save(typeConge);
    }

    @Transactional
    public TypeConge updateType(Long id, TypeConge typeDetails) {
        TypeConge type = typeCongeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type non trouvé"));

        type.setNom(typeDetails.getNom());
        type.setCode(typeDetails.getCode());
        type.setJoursParAn(typeDetails.getJoursParAn());

        return typeCongeRepository.save(type);
    }

    @Transactional
    public void deleteType(Long id) {
        typeCongeRepository.deleteById(id);
    }
}
