package com.academicmanagement.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "attendance", indexes = {
    @Index(name = "idx_attendance_lesson", columnList = "lessonId"),
    @Index(name = "idx_attendance_student", columnList = "studentId"),
    @Index(name = "uk_attendance_lesson_student", columnList = "lessonId, studentId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends BaseEntity {

    @Column(nullable = false)
    private UUID lessonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lessonId", insertable = false, updatable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private UUID studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentId", insertable = false, updatable = false)
    private User student;

    @Column(nullable = false)
    @Builder.Default
    private Boolean present = false;
}
