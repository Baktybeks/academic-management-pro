package com.academicmanagement.web.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CommonDto {
    private UUID id;
    private Instant createdAt;
    private Instant updatedAt;
}
