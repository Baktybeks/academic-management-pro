package com.academicmanagement.repository;

import com.academicmanagement.domain.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, UUID> {

    List<TeacherAssignment> findByTeacherId(UUID teacherId);

    List<TeacherAssignment> findByGroupId(UUID groupId);

    Optional<TeacherAssignment> findByTeacherIdAndGroupIdAndSubjectId(UUID teacherId, UUID groupId, UUID subjectId);
}
