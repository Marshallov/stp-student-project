package com.example.student.service.impl;

import com.example.student.dto.user.UserRequest;
import com.example.student.exception.EmailAlreadyExistsException;
import com.example.student.exception.EntityNotFoundException;
import com.example.student.mapper.UserMapper;
import com.example.student.model.Role;
import com.example.student.model.User;
import com.example.student.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceImplTest {
    private UserRepository repository;
    private UserMapper mapper;
    private PasswordEncoder encoder;
    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(UserRepository.class);
        mapper = mock(UserMapper.class);
        encoder = mock(PasswordEncoder.class);
        service = new UserServiceImpl(repository, mapper, encoder);
    }

    @Test
    void delegatesEmailLookupAndListing() {
        when(repository.existsByEmail("a@example.com")).thenReturn(true);
        assertTrue(service.existsByEmail("a@example.com"));
        when(repository.findAll()).thenReturn(java.util.List.of());
        when(mapper.toListResponse(java.util.List.of())).thenReturn(null);
        assertNull(service.findAll());
    }

    @Test
    void registersOnlyNewMappableUsersAndEncodesPassword() {
        UserRequest request = new UserRequest("a@example.com", "secret", Set.of(Role.ADMIN));
        User user = new User();
        user.setEmail("a@example.com");
        user.setPassword("secret");
        when(mapper.toEntity(request)).thenReturn(user);
        when(repository.existsByEmail("a@example.com")).thenReturn(false);
        when(encoder.encode("secret")).thenReturn("encoded");
        assertTrue(service.register(request));
        assertEquals("encoded", user.getPassword());
        verify(repository).save(user);

        when(mapper.toEntity(request)).thenReturn(null);
        assertFalse(service.register(request));
        user.setEmail(null);
        when(mapper.toEntity(request)).thenReturn(user);
        assertFalse(service.register(request));
        user.setEmail("a@example.com");
        user.setPassword(" ");
        when(mapper.toEntity(request)).thenReturn(user);
        when(repository.existsByEmail("a@example.com")).thenReturn(true);
        assertFalse(service.register(request));
    }

    @Test
    void registersWithoutEncodingBlankPassword() {
        UserRequest request = new UserRequest();
        User user = new User();
        user.setEmail("new@example.com");
        user.setPassword("");
        when(mapper.toEntity(request)).thenReturn(user);
        when(repository.existsByEmail(user.getEmail())).thenReturn(false);
        assertTrue(service.register(request));
        verifyNoInteractions(encoder);
    }

    @Test
    void registersWithoutEncodingNullPassword() {
        UserRequest request = new UserRequest();
        User user = new User();
        user.setEmail("new@example.com");
        when(mapper.toEntity(request)).thenReturn(user);
        when(repository.existsByEmail(user.getEmail())).thenReturn(false);
        assertTrue(service.register(request));
        verifyNoInteractions(encoder);
    }

    @Test
    void findsUserOrThrows() {
        User user = new User();
        when(repository.findByEmail("a@example.com")).thenReturn(Optional.of(user));
        assertSame(user, service.findByEmail("a@example.com"));
        when(repository.findByEmail("missing@example.com")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.findByEmail("missing@example.com"));
    }

    @Test
    void savesNewUserAndRejectsDuplicate() {
        UserRequest request = new UserRequest("a@example.com", "secret", Set.of(Role.TEACHER));
        when(repository.existsByEmail(request.getEmail())).thenReturn(false);
        when(encoder.encode("secret")).thenReturn("encoded");
        User stored = new User();
        when(repository.save(any(User.class))).thenReturn(stored);
        when(mapper.toResponse(stored)).thenReturn(null);
        assertNull(service.save(request));
        verify(repository).save(argThat(user ->
                user.getEmail().equals(request.getEmail())
                        && user.getPassword().equals("encoded")
                        && user.getRoles().equals(request.getRoles())));

        when(repository.existsByEmail(request.getEmail())).thenReturn(true);
        assertThrows(EmailAlreadyExistsException.class, () -> service.save(request));
    }

    @Test
    void updatesExistingUserWithAndWithoutPasswordChanges() {
        User user = new User();
        user.setEmail("old@example.com");
        user.setPassword("old-hash");
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        when(repository.save(user)).thenReturn(user);
        when(mapper.toResponse(user)).thenReturn(null);

        UserRequest unchanged = new UserRequest("old@example.com", " ", Set.of(Role.ADMIN));
        assertNull(service.updateUser(1L, unchanged));
        verify(repository, never()).existsByEmail("old@example.com");
        assertEquals("old-hash", user.getPassword());

        UserRequest changed = new UserRequest("new@example.com", "new-secret", Set.of(Role.TEACHER));
        when(repository.existsByEmail("new@example.com")).thenReturn(false);
        when(encoder.encode("new-secret")).thenReturn("new-hash");
        assertNull(service.updateUser(1L, changed));
        assertEquals("new@example.com", user.getEmail());
        assertEquals("new-hash", user.getPassword());

        when(repository.existsByEmail("taken@example.com")).thenReturn(true);
        assertThrows(EmailAlreadyExistsException.class, () -> service.updateUser(
                1L, new UserRequest("taken@example.com", null, Set.of())));
        when(repository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.updateUser(2L, unchanged));
    }

    @Test
    void deletesUser() {
        service.deleteById(4L);
        verify(repository).deleteById(4L);
    }
}
