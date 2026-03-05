package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "survey_responses", indexes = {
    @Index(name = "idx_survey_response_survey", columnList = "surveyId"),
    @Index(name = "idx_survey_response_student", columnList = "studentId"),
    @Index(name = "idx_survey_response_teacher", columnList = "teacherId"),
    @Index(name = "idx_survey_response_period", columnList = "surveyPeriodId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyResponse extends BaseEntity {

    @Column(nullable = false)
    private UUID surveyId;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private UUID teacherId;

    @Column(nullable = false)
    private UUID subjectId;

    @Column(nullable = false)
    private UUID surveyPeriodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surveyPeriodId", insertable = false, updatable = false)
    private SurveyPeriod surveyPeriod;

    @Column(nullable = false)
    private Instant submittedAt;
}
