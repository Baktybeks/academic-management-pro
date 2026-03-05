package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "surveys", indexes = {
    @Index(name = "idx_survey_active", columnList = "isActive"),
    @Index(name = "idx_survey_created_by", columnList = "createdById")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Survey extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_by_id", nullable = false)
    private UUID createdById;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", insertable = false, updatable = false)
    private User createdBy;
}
