package com.academicmanagement.service;

import com.academicmanagement.domain.Group;
import com.academicmanagement.domain.User;
import com.academicmanagement.repository.GroupRepository;
import com.academicmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public List<Group> findAll() {
        return groupRepository.findAll(Sort.by("title"));
    }

    public Group findById(UUID id) {
        return groupRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Group not found: " + id));
    }

    @Transactional
    public Group create(String title, UUID createdById, Set<UUID> studentIds) {
        Group group = Group.builder()
            .title(title)
            .createdById(createdById)
            .students(studentIds != null && !studentIds.isEmpty()
                ? studentIds.stream().map(userRepository::getReferenceById).collect(Collectors.toSet())
                : Set.of())
            .build();
        return groupRepository.save(group);
    }

    @Transactional
    public Group update(UUID id, String title, Set<UUID> studentIds) {
        Group group = findById(id);
        if (title != null) group.setTitle(title);
        if (studentIds != null) {
            group.setStudents(studentIds.stream().map(userRepository::getReferenceById).collect(Collectors.toSet()));
        }
        return groupRepository.save(group);
    }

    @Transactional
    public void delete(UUID id) {
        groupRepository.deleteById(id);
    }
}
