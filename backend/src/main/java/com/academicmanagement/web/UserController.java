package com.academicmanagement.web;

import com.academicmanagement.domain.User;
import com.academicmanagement.domain.UserRole;
import com.academicmanagement.service.UserService;
import com.academicmanagement.web.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ACADEMIC_ADVISOR')")
    public List<UserDto.Response> list(@RequestParam(required = false) UserRole role) {
        List<User> users = role != null ? userService.findByRole(role) : userService.findAll();
        return users.stream().map(UserDto.Response::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ACADEMIC_ADVISOR')")
    public ResponseEntity<UserDto.Response> get(@PathVariable UUID id) {
        return ResponseEntity.ok(UserDto.Response.from(userService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ACADEMIC_ADVISOR')")
    public ResponseEntity<UserDto.Response> create(
        @Valid @RequestBody UserDto.CreateRequest request,
        @RequestParam(required = false) UUID createdBy
    ) {
        User user = userService.create(
            request.getName(),
            request.getEmail(),
            request.getPassword(),
            request.getRole(),
            createdBy
        );
        return ResponseEntity.ok(UserDto.Response.from(user));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ACADEMIC_ADVISOR')")
    public ResponseEntity<UserDto.Response> update(@PathVariable UUID id, @RequestBody UserDto.UpdateRequest request) {
        User user = userService.update(id, request.getName(), request.getIsActive());
        return ResponseEntity.ok(UserDto.Response.from(user));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ACADEMIC_ADVISOR')")
    public ResponseEntity<UserDto.Response> activate(@PathVariable UUID id) {
        User user = userService.activate(id);
        return ResponseEntity.ok(UserDto.Response.from(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
