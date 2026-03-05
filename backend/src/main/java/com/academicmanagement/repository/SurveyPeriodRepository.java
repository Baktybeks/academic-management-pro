package com.academicmanagement.repository;

import com.academicmanagement.domain.SurveyPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SurveyPeriodRepository extends JpaRepository<SurveyPeriod, UUID> {

    List<SurveyPeriod> findBySurveyId(UUID surveyId);

    List<SurveyPeriod> findBySurveyIdAndIsActiveTrue(UUID surveyId);
}
