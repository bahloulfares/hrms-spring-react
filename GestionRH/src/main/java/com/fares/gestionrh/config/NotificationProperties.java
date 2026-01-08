package com.fares.gestionrh.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "notification")
public class NotificationProperties {

    private Email email = new Email();
    private Slack slack = new Slack();
    private Sms sms = new Sms();

    @Data
    public static class Email {
        private boolean enabled = false;
        private String from;
        private List<String> to = new ArrayList<>();
    }

    @Data
    public static class Slack {
        private boolean enabled = false;
        private String webhookUrl;
    }

    @Data
    public static class Sms {
        private boolean enabled = false;
        private String webhookUrl;
        private String to;
    }
}
