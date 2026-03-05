package com.academicmanagement.repository;

import com.academicmanagement.domain.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findByGroupIdOrderByDateDesc(UUID groupId);

    List<Lesson> findByTeacherIdOrderByDateDesc(UUID teacherId);

    List<Lesson> findBySubjectIdAndGroupIdOrderByDateDesc(UUID subjectId, UUID groupId);
}
