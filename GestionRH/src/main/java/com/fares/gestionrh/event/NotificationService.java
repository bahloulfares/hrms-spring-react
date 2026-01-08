package com.fares.gestionrh.event;

import com.fares.gestionrh.config.NotificationProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;
    private final RestTemplate notificationRestTemplate;
    private final NotificationProperties notificationProperties;

    public void dispatch(LeaveEvent event) {
        if (notificationProperties.getEmail().isEnabled()) {
            sendEmail(event);
        }
        if (notificationProperties.getSlack().isEnabled()) {
            sendSlack(event);
        }
        if (notificationProperties.getSms().isEnabled()) {
            sendSms(event);
        }
    }

    private void sendEmail(LeaveEvent event) {
        List<String> recipients = new ArrayList<>();
        if (event.getEmployeeEmail() != null && !event.getEmployeeEmail().isBlank()) {
            recipients.add(event.getEmployeeEmail());
        }
        if (!CollectionUtils.isEmpty(notificationProperties.getEmail().getTo())) {
            recipients.addAll(notificationProperties.getEmail().getTo());
        }
        if (recipients.isEmpty()) {
            log.warn("Email notification skipped: no recipients defined for event {}", event.getType());
            return;
        }

        String subject = String.format("[%s] Congé %s", event.getType(), event.getStatus());
        String body = buildBody(event);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(notificationProperties.getEmail().getFrom());
            message.setTo(recipients.toArray(new String[0]));
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email notification sent to {} for leave {}", recipients, event.getLeaveId());
        } catch (MailException ex) {
            log.error("Failed to send email notification for leave {}", event.getLeaveId(), ex);
        }
    }

    private void sendSlack(LeaveEvent event) {
        String webhook = notificationProperties.getSlack().getWebhookUrl();
        if (webhook == null || webhook.isBlank()) {
            log.warn("Slack notification skipped: webhook URL missing");
            return;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("text", buildBody(event));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            notificationRestTemplate.postForEntity(webhook, new HttpEntity<>(payload, headers), Void.class);
            log.info("Slack notification sent for leave {}", event.getLeaveId());
        } catch (Exception ex) {
            log.error("Failed to send Slack notification for leave {}", event.getLeaveId(), ex);
        }
    }

    private void sendSms(LeaveEvent event) {
        String webhook = notificationProperties.getSms().getWebhookUrl();
        if (webhook == null || webhook.isBlank()) {
            log.warn("SMS notification skipped: webhook URL missing");
            return;
        }
        String to = notificationProperties.getSms().getTo();
        if (to == null || to.isBlank()) {
            log.warn("SMS notification skipped: destination number missing");
            return;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("to", to);
        payload.put("message", buildBody(event));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            notificationRestTemplate.postForEntity(webhook, new HttpEntity<>(payload, headers), Void.class);
            log.info("SMS notification sent for leave {} to {}", event.getLeaveId(), to);
        } catch (Exception ex) {
            log.error("Failed to send SMS notification for leave {}", event.getLeaveId(), ex);
        }
    }

    private String buildBody(LeaveEvent event) {
        StringBuilder sb = new StringBuilder();
        sb.append("Type: ").append(event.getType()).append('\n');
        sb.append("Leave ID: ").append(event.getLeaveId()).append('\n');
        sb.append("Status: ").append(event.getStatus()).append('\n');
        sb.append("Duration (days): ").append(event.getDurationDays()).append('\n');
        sb.append("Leave type: ").append(event.getLeaveTypeCode()).append('\n');
        sb.append("Employee: ").append(event.getEmployeeEmail());
        return sb.toString();
    }
}
