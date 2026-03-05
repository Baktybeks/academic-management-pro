package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "assignments", indexes = {
    @Index(name = "idx_assignment_group", columnList = "groupId"),
    @Index(name = "idx_assignment_subject", columnList = "subjectId"),
    @Index(name = "idx_assignment_teacher", columnList = "teacherId"),
    @Index(name = "idx_assignment_active", columnList = "isActive"),
    @Index(name = "idx_assignment_due", columnList = "dueDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private UUID groupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupId", insertable = false, updatable = false)
    private Group group;

    @Column(nullable = false)
    private UUID subjectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subjectId", insertable = false, updatable = false)
    private Subject subject;

    @Column(nullable = false)
    private UUID teacherId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherId", insertable = false, updatable = false)
    private User teacher;

    @Column(nullable = false)
    private Instant dueDate;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxScore = 100;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
