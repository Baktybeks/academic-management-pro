package com.academicmanagement.service;

import com.academicmanagement.domain.Subject;
import com.academicmanagement.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<Subject> findAll() {
        return subjectRepository.findAll(Sort.by("title"));
    }

    public Subject findById(UUID id) {
        return subjectRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + id));
    }

    @Transactional
    public Subject create(String title, String description, UUID createdById) {
        Subject subject = Subject.builder()
            .title(title)
            .description(description)
            .createdById(createdById)
            .isActive(true)
            .build();
        return subjectRepository.save(subject);
    }

    @Transactional
    public Subject update(UUID id, String title, String description, Boolean isActive) {
        Subject subject = findById(id);
        if (title != null) subject.setTitle(title);
        if (description != null) subject.setDescription(description);
        if (isActive != null) subject.setIsActive(isActive);
        return subjectRepository.save(subject);
    }

    @Transactional
    public void delete(UUID id) {
        subjectRepository.deleteById(id);
    }
}
