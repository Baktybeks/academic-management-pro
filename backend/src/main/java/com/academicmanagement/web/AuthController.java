package com.academicmanagement.web;

import com.academicmanagement.domain.User;
import com.academicmanagement.security.JwtUtil;
import com.academicmanagement.service.AuthService;
import com.academicmanagement.web.dto.AuthDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        User user = authService.register(
            request.getName(),
            request.getEmail(),
            request.getPassword(),
            request.getRole()
        );
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthDto.AuthResponse(token, AuthDto.UserResponse.from(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        AuthService.AuthLoginResult result = authService.loginWithUser(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new AuthDto.AuthResponse(result.token(), AuthDto.UserResponse.from(result.user())));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDto.UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(AuthDto.UserResponse.from(user));
    }
}
