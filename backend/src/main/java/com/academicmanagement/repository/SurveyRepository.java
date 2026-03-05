package com.academicmanagement.repository;

import com.academicmanagement.domain.Survey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SurveyRepository extends JpaRepository<Survey, UUID> {
}
