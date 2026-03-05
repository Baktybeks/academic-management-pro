package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "survey_answers", indexes = {
    @Index(name = "idx_survey_answer_response", columnList = "responseId"),
    @Index(name = "idx_survey_answer_question", columnList = "questionId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyAnswer extends BaseEntity {

    @Column(nullable = false)
    private UUID responseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responseId", insertable = false, updatable = false)
    private SurveyResponse response;

    @Column(nullable = false)
    private UUID questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questionId", insertable = false, updatable = false)
    private SurveyQuestion question;

    @Column(nullable = false)
    private Integer value; // 0-10
}
