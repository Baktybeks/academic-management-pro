package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lessons", indexes = {
    @Index(name = "idx_lesson_group", columnList = "groupId"),
    @Index(name = "idx_lesson_subject", columnList = "subjectId"),
    @Index(name = "idx_lesson_teacher", columnList = "teacherId"),
    @Index(name = "idx_lesson_date", columnList = "date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Instant date;

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
}
