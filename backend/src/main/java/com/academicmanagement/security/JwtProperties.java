package com.academicmanagement.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret = "change-me-in-production-use-long-secret-at-least-256-bits";
    private long expirationMs = 86400000; // 24 hours
    private String headerName = "Authorization";
    private String headerPrefix = "Bearer ";
}
