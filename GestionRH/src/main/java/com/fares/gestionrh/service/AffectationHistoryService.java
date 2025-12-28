package com.fares.gestionrh.service;

import com.fares.gestionrh.dto.history.AffectationHistoryDTO;
import java.util.List;

public interface AffectationHistoryService {
    List<AffectationHistoryDTO> getAllHistory();

    List<AffectationHistoryDTO> getHistoryByEmployee(Long employeeId);
}
