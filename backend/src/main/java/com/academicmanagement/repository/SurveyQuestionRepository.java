package com.academicmanagement.repository;

import com.academicmanagement.domain.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, UUID> {

    List<SurveyQuestion> findBySurveyIdOrderByOrderAsc(UUID surveyId);
}
