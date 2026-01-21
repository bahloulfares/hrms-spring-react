package com.fares.gestionrh.event;

import com.fares.gestionrh.entity.StatutConge;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "notification.email.enabled=true",
        "notification.email.from=no-reply@test.com",
        "notification.email.to=",
        "notification.slack.enabled=false",
        "notification.slack.webhook-url=",
        "notification.sms.enabled=false",
        "notification.sms.webhook-url=",
        "notification.sms.to=+33123456789",
        "spring.mail.host=localhost",
        "spring.mail.port=3025",
        "spring.mail.properties.mail.smtp.auth=false",
        "spring.mail.properties.mail.smtp.starttls.enable=false"
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class LeaveEventListenerIntegrationTest {

    private static GreenMail greenMail;

    @Autowired
    private ApplicationEventPublisher publisher;

    @BeforeAll
    static void startMail() {
        greenMail = new GreenMail(ServerSetupTest.SMTP);
        greenMail.start();
    }

    @AfterAll
    static void stopMail() {
        if (greenMail != null) {
            greenMail.stop();
        }
    }

    @Test
    @DisplayName("Leave events trigger email notifications")
    @Transactional
    void listenerDispatchesEmailNotification() throws Exception {
        LeaveEvent event = LeaveEvent.builder()
                .type(LeaveEvent.EventType.CREATED)
                .leaveId(42L)
                .employeeEmail("emp@example.com")
                .leaveTypeCode("CP")
                .statutConge(StatutConge.EN_ATTENTE)
                .durationDays(1.0)
                .createdAt(LocalDateTime.now())
                .build();

        publisher.publishEvent(event);

        // Wait for the transactional event to be processed after transaction commit
        boolean mailReceived = greenMail.waitForIncomingEmail(10000, 1);
        assertThat(mailReceived).isTrue();
        MimeMessage[] messages = greenMail.getReceivedMessages();
        assertThat(messages).hasSize(1);
        assertThat(messages[0].getAllRecipients()[0].toString()).isEqualTo("emp@example.com");
    }
}
