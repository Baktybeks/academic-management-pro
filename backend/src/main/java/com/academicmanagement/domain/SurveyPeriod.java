package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "survey_periods", indexes = {
    @Index(name = "idx_survey_period_survey", columnList = "surveyId"),
    @Index(name = "idx_survey_period_active", columnList = "isActive"),
    @Index(name = "idx_survey_period_created_by", columnList = "createdById")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyPeriod extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private UUID surveyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surveyId", insertable = false, updatable = false)
    private Survey survey;

    @Column(nullable = false)
    private Instant startDate;

    @Column(nullable = false)
    private Instant endDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @Column(name = "created_by_id", nullable = false)
    private UUID createdById;
}
