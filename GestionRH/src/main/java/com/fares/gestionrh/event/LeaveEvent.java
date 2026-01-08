package com.fares.gestionrh.event;

import com.fares.gestionrh.entity.StatutConge;

import java.time.LocalDateTime;

public class LeaveEvent {

    public enum Type {
        CREATED,
        VALIDATED,
        REJECTED,
        CANCELLED
    }

    private final Type type;
    private final Long leaveId;
    private final String employeeEmail;
    private final String leaveTypeCode;
    private final StatutConge status;
    private final double durationDays;
    private final LocalDateTime createdAt;

    public LeaveEvent(Type type,
                      Long leaveId,
                      String employeeEmail,
                      String leaveTypeCode,
                      StatutConge status,
                      double durationDays,
                      LocalDateTime createdAt) {
        this.type = type;
        this.leaveId = leaveId;
        this.employeeEmail = employeeEmail;
        this.leaveTypeCode = leaveTypeCode;
        this.status = status;
        this.durationDays = durationDays;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Type getType() {
        return type;
    }

    public Long getLeaveId() {
        return leaveId;
    }

    public String getEmployeeEmail() {
        return employeeEmail;
    }

    public String getLeaveTypeCode() {
        return leaveTypeCode;
    }

    public StatutConge getStatus() {
        return status;
    }

    public double getDurationDays() {
        return durationDays;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
