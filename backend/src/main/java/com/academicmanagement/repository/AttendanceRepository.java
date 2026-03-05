package com.academicmanagement.repository;

import com.academicmanagement.domain.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    List<Attendance> findByLessonId(UUID lessonId);

    Optional<Attendance> findByLessonIdAndStudentId(UUID lessonId, UUID studentId);
}
