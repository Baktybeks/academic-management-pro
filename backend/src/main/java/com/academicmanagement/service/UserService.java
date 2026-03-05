package com.academicmanagement.service;

import com.academicmanagement.domain.User;
import com.academicmanagement.domain.UserRole;
import com.academicmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAll(Sort.by("name"));
    }

    public List<User> findByRole(UserRole role) {
        return userRepository.findAll().stream()
            .filter(u -> u.getRole() == role)
            .toList();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    @Transactional
    public User create(String name, String email, String password, UserRole role, UUID createdById) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Пользователь с таким email уже существует");
        }
        User user = User.builder()
            .name(name)
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .role(role)
            .isActive(false)
            .build();
        return userRepository.save(user);
    }

    @Transactional
    public User update(UUID id, String name, Boolean isActive) {
        User user = findById(id);
        if (name != null) user.setName(name);
        if (isActive != null) user.setIsActive(isActive);
        return userRepository.save(user);
    }

    @Transactional
    public User activate(UUID id) {
        User user = findById(id);
        user.setIsActive(true);
        return userRepository.save(user);
    }

    @Transactional
    public void delete(UUID id) {
        userRepository.deleteById(id);
    }
}
