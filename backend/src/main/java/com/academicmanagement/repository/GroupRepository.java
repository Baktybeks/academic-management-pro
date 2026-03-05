package com.academicmanagement.repository;

import com.academicmanagement.domain.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {

    @Query("SELECT g FROM Group g JOIN g.students s WHERE s.id = :studentId")
    List<Group> findAllByStudentId(UUID studentId);
}
