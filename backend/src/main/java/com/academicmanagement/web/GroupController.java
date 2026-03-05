package com.academicmanagement.web;

import com.academicmanagement.domain.Group;
import com.academicmanagement.security.AppUserDetails;
import com.academicmanagement.service.GroupService;
import com.academicmanagement.web.dto.GroupDto;
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
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public List<GroupDto.Response> list() {
        return groupService.findAll().stream().map(GroupDto.Response::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDto.Response> get(@PathVariable UUID id) {
        return ResponseEntity.ok(GroupDto.Response.from(groupService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ACADEMIC_ADVISOR')")
    public ResponseEntity<GroupDto.Response> create(
        @Valid @RequestBody GroupDto.CreateRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID createdBy = ((AppUserDetails) userDetails).getUser().getId();
        Group group = groupService.create(request.getTitle(), createdBy, request.getStudentIds());
        return ResponseEntity.ok(GroupDto.Response.from(group));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ACADEMIC_ADVISOR')")
    public ResponseEntity<GroupDto.Response> update(@PathVariable UUID id, @RequestBody GroupDto.UpdateRequest request) {
        Group group = groupService.update(id, request.getTitle(), request.getStudentIds());
        return ResponseEntity.ok(GroupDto.Response.from(group));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        groupService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
