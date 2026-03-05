package com.academicmanagement.repository;

import com.academicmanagement.domain.GradingPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GradingPeriodRepository extends JpaRepository<GradingPeriod, UUID> {

    List<GradingPeriod> findByIsActiveTrue();
}
