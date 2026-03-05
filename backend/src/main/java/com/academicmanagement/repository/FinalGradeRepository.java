package com.academicmanagement.repository;

import com.academicmanagement.domain.FinalGrade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FinalGradeRepository extends JpaRepository<FinalGrade, UUID> {

    List<FinalGrade> findByStudentId(UUID studentId);

    List<FinalGrade> findByStudentIdAndGradingPeriodId(UUID studentId, UUID gradingPeriodId);

    Optional<FinalGrade> findByStudentIdAndSubjectIdAndGradingPeriodId(UUID studentId, UUID subjectId, UUID gradingPeriodId);
}
