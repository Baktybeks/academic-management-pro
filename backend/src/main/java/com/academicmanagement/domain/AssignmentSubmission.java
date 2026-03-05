package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "assignment_submissions", indexes = {
    @Index(name = "idx_submission_assignment", columnList = "assignmentId"),
    @Index(name = "idx_submission_student", columnList = "studentId"),
    @Index(name = "idx_submission_checked", columnList = "isChecked"),
    @Index(name = "uk_submission_assignment_student", columnList = "assignmentId, studentId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission extends BaseEntity {

    @Column(nullable = false)
    private UUID assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignmentId", insertable = false, updatable = false)
    private Assignment assignment;

    @Column(nullable = false)
    private UUID studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentId", insertable = false, updatable = false)
    private User student;

    @Column(nullable = false, length = 500)
    private String submissionUrl;

    @Column(nullable = false)
    private Instant submittedAt;

    private Integer score;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isChecked = false;

    private Instant checkedAt;

    private UUID checkedBy;
}
