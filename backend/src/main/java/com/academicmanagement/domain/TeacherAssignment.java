package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "teacher_assignments", indexes = {
    @Index(name = "idx_ta_teacher", columnList = "teacherId"),
    @Index(name = "idx_ta_group", columnList = "groupId"),
    @Index(name = "idx_ta_subject", columnList = "subjectId"),
    @Index(name = "uk_ta_teacher_group_subject", columnList = "teacherId, groupId, subjectId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherAssignment extends BaseEntity {

    @Column(nullable = false)
    private UUID teacherId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacherId", insertable = false, updatable = false)
    private User teacher;

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
    private UUID assignedBy;
}
