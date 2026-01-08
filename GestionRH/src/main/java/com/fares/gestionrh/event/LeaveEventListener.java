package com.fares.gestionrh.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveEventListener {

    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleLeaveEvent(LeaveEvent event) {
        log.info("Leave event: type={}, id={}, status={}, email={}, days={}",
                event.getType(), event.getLeaveId(), event.getStatus(), event.getEmployeeEmail(), event.getDurationDays());
        notificationService.dispatch(event);
    }
}
