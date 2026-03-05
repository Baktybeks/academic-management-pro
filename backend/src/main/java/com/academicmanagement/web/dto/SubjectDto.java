package com.academicmanagement.web.dto;

import com.academicmanagement.domain.Subject;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

public class SubjectDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        @Size(max = 255)
        private String title;

        @Size(max = 1000)
        private String description;
    }

    @Data
    public static class UpdateRequest {
        @Size(max = 255)
        private String title;

        @Size(max = 1000)
        private String description;

        private Boolean isActive;
    }

    @Data
    public static class Response {
        private UUID id;
        private String title;
        private String description;
        private UUID createdById;
        private Boolean isActive;
        private java.time.Instant createdAt;

        public static Response from(Subject s) {
            Response r = new Response();
            r.setId(s.getId());
            r.setTitle(s.getTitle());
            r.setDescription(s.getDescription());
            r.setCreatedById(s.getCreatedById());
            r.setIsActive(s.getIsActive());
            r.setCreatedAt(s.getCreatedAt());
            return r;
        }
    }
}
