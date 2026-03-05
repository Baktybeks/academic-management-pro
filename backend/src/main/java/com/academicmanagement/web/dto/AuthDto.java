package com.academicmanagement.web.dto;

import com.academicmanagement.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
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

        private UserRole role;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private UserResponse user;

        public AuthResponse(String token, UserResponse user) {
            this.token = token;
            this.user = user;
        }
    }

    @Data
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        private String role;
        private Boolean isActive;

        public static UserResponse from(com.academicmanagement.domain.User user) {
            UserResponse r = new UserResponse();
            r.setId(user.getId().toString());
            r.setName(user.getName());
            r.setEmail(user.getEmail());
            r.setRole(user.getRole().name());
            r.setIsActive(user.getIsActive());
            return r;
        }
    }
}
