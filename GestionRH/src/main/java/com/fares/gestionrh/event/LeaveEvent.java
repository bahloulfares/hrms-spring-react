package com.fares.gestionrh.event;

import com.fares.gestionrh.entity.StatutConge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveEvent {

    public enum EventType {
        CREATED,
        APPROVED,
        REJECTED,
        CANCELLED
    }

    private EventType type;
    private Long leaveId;
    private String employeeName;
    private String employeeEmail;
    private String status;
    private String leaveType;
    private String leaveTypeCode;
    private StatutConge statutConge;
    private LocalDate startDate;
    private LocalDate endDate;
    private double durationDays;
    private LocalDateTime createdAt;
}
