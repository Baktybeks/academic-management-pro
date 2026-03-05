package com.academicmanagement.repository;

import com.academicmanagement.domain.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {

    List<AssignmentSubmission> findByAssignmentId(UUID assignmentId);

    List<AssignmentSubmission> findByStudentId(UUID studentId);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);
}
