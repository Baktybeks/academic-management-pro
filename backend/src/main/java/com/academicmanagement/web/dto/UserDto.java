package com.academicmanagement.web.dto;

import com.academicmanagement.domain.User;
import com.academicmanagement.domain.UserRole;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

public class UserDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        @Size(max = 255)
        private String name;

        @NotBlank
        @Email
        @Size(max = 320)
        private String email;

        @NotBlank
        @Size(min = 6, max = 100)
        private String password;

        @NotNull
        private UserRole role;
    }

    @Data
    public static class UpdateRequest {
        @Size(max = 255)
        private String name;
        private Boolean isActive;
    }

    @Data
    public static class Response {
        private UUID id;
        private String name;
        private String email;
        private String role;
        private Boolean isActive;
        private java.time.Instant createdAt;

        public static Response from(User user) {
            Response r = new Response();
            r.setId(user.getId());
            r.setName(user.getName());
            r.setEmail(user.getEmail());
            r.setRole(user.getRole().name());
            r.setIsActive(user.getIsActive());
            r.setCreatedAt(user.getCreatedAt());
            return r;
        }
    }
}
