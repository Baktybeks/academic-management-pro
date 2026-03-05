package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "final_grades", indexes = {
    @Index(name = "idx_final_grade_student", columnList = "studentId"),
    @Index(name = "idx_final_grade_subject", columnList = "subjectId"),
    @Index(name = "idx_final_grade_period", columnList = "gradingPeriodId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalGrade extends BaseEntity {

    @Column(nullable = false)
    private UUID studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentId", insertable = false, updatable = false)
    private User student;

    @Column(nullable = false)
    private UUID subjectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subjectId", insertable = false, updatable = false)
    private Subject subject;

    @Column(nullable = false)
    private UUID groupId;

    @Column(nullable = false)
    private UUID teacherId;

    @Column(nullable = false)
    private UUID gradingPeriodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gradingPeriodId", insertable = false, updatable = false)
    private GradingPeriod gradingPeriod;

    @Column(nullable = false)
    private Integer totalScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LetterGrade letterGrade;
}
