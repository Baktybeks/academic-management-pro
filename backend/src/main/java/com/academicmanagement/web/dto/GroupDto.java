package com.academicmanagement.web.dto;

import com.academicmanagement.domain.Group;
import com.academicmanagement.domain.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class GroupDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        @Size(max = 255)
        private String title;

        private Set<UUID> studentIds;
    }

    @Data
    public static class UpdateRequest {
        @Size(max = 255)
        private String title;

        private Set<UUID> studentIds;
    }

    @Data
    public static class Response {
        private UUID id;
        private String title;
        private UUID createdById;
        private Set<UUID> studentIds;
        private java.time.Instant createdAt;

        public static Response from(Group g) {
            Response r = new Response();
            r.setId(g.getId());
            r.setTitle(g.getTitle());
            r.setCreatedById(g.getCreatedById());
            r.setStudentIds(g.getStudents().stream().map(User::getId).collect(Collectors.toSet()));
            r.setCreatedAt(g.getCreatedAt());
            return r;
        }
    }
}
