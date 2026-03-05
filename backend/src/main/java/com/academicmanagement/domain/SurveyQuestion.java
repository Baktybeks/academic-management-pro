package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "survey_questions", indexes = {
    @Index(name = "idx_survey_question_survey", columnList = "surveyId"),
    @Index(name = "idx_survey_question_order", columnList = "orderIndex")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyQuestion extends BaseEntity {

    @Column(nullable = false)
    private UUID surveyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surveyId", insertable = false, updatable = false)
    private Survey survey;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(name = "order_index", nullable = false)
    private Integer order;
}
