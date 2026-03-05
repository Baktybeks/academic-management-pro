package com.academicmanagement.security;

import com.academicmanagement.domain.User;
import com.academicmanagement.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final JwtProperties properties;
    private final SecretKey key;

    public JwtUtil(JwtProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        return Jwts.builder()
            .subject(user.getEmail())
            .claim("userId", user.getId().toString())
            .claim("role", user.getRole().name())
            .claim("name", user.getName())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + properties.getExpirationMs()))
            .signWith(key)
            .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String getEmailFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(parseToken(token).get("userId", String.class));
    }

    public UserRole getRoleFromToken(String token) {
        return UserRole.valueOf(parseToken(token).get("role", String.class));
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
