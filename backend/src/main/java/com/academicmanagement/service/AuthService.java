package com.academicmanagement.service;

import com.academicmanagement.domain.User;
import com.academicmanagement.domain.UserRole;
import com.academicmanagement.repository.UserRepository;
import com.academicmanagement.security.AppUserDetails;
import com.academicmanagement.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public User register(String name, String email, String password, UserRole role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Пользователь с таким email уже существует");
        }
        long adminCount = userRepository.countByRole(UserRole.SUPER_ADMIN);
        UserRole finalRole = (adminCount == 0) ? UserRole.SUPER_ADMIN : (role != null ? role : UserRole.STUDENT);
        boolean isActive = finalRole == UserRole.SUPER_ADMIN;

        User user = User.builder()
            .name(name)
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .role(finalRole)
            .isActive(isActive)
            .build();
        return userRepository.save(user);
    }

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("Неверный email или пароль"));
        if (!user.getIsActive() && user.getRole() != UserRole.SUPER_ADMIN) {
            throw new BadCredentialsException("Учётная запись не активирована");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadCredentialsException("Неверный email или пароль");
        }
        return jwtUtil.generateToken(user);
    }

    public User getCurrentUser(UserDetails userDetails) {
        if (userDetails instanceof AppUserDetails appUserDetails) {
            return appUserDetails.getUser();
        }
        return null;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("User not found"));
    }

    public AuthLoginResult loginWithUser(String email, String password) {
        String token = login(email, password);
        User user = getUserByEmail(email);
        return new AuthLoginResult(token, user);
    }

    public record AuthLoginResult(String token, User user) {}
}
