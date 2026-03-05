package com.academicmanagement.web;

import com.academicmanagement.domain.Subject;
import com.academicmanagement.security.AppUserDetails;
import com.academicmanagement.service.SubjectService;
import com.academicmanagement.web.dto.SubjectDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public List<SubjectDto.Response> list() {
        return subjectService.findAll().stream().map(SubjectDto.Response::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDto.Response> get(@PathVariable UUID id) {
        return ResponseEntity.ok(SubjectDto.Response.from(subjectService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SubjectDto.Response> create(
        @Valid @RequestBody SubjectDto.CreateRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID createdBy = ((AppUserDetails) userDetails).getUser().getId();
        Subject subject = subjectService.create(request.getTitle(), request.getDescription(), createdBy);
        return ResponseEntity.ok(SubjectDto.Response.from(subject));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SubjectDto.Response> update(@PathVariable UUID id, @RequestBody SubjectDto.UpdateRequest request) {
        Subject subject = subjectService.update(id, request.getTitle(), request.getDescription(), request.getIsActive());
        return ResponseEntity.ok(SubjectDto.Response.from(subject));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
