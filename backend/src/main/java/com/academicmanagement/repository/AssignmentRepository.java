package com.academicmanagement.repository;

import com.academicmanagement.domain.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    List<Assignment> findByGroupId(UUID groupId);

    List<Assignment> findByTeacherId(UUID teacherId);

    List<Assignment> findByGroupIdAndIsActiveTrue(UUID groupId);
}
