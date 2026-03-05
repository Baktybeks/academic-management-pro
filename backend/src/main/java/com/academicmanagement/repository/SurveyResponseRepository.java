package com.academicmanagement.repository;

import com.academicmanagement.domain.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, UUID> {

    List<SurveyResponse> findBySurveyPeriodId(UUID surveyPeriodId);

    Optional<SurveyResponse> findByStudentIdAndTeacherIdAndSubjectIdAndSurveyPeriodId(
        UUID studentId, UUID teacherId, UUID subjectId, UUID surveyPeriodId
    );
}
