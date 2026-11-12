package com.example.student;

import com.example.student.configuration.AppInitializer;
import com.example.student.configuration.SecurityConfiguration;
import com.example.student.exception.EntityNotFoundException;
import com.example.student.exception.GlobalExceptionHandler;
import com.example.student.model.Role;
import com.example.student.model.Student;
import com.example.student.model.User;
import com.example.student.repository.StudentRepository;
import com.example.student.repository.UserRepository;
import com.example.student.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OtherComponentsTest {
    @Test
    void loadsUsersAndConvertsRolesToAuthorities() {
        UserRepository repository = mock(UserRepository.class);
        User user = User.builder().id(1L).email("admin@example.com").password("hash")
                .roles(Set.of(Role.ADMIN, Role.TEACHER)).build();
        when(repository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        CustomUserDetailsService service = new CustomUserDetailsService(repository);

        UserDetails details = service.loadUserByUsername("admin@example.com");
        assertEquals("admin@example.com", details.getUsername());
        assertEquals("hash", details.getPassword());
        assertEquals(Set.of("ROLE_ADMIN", "ROLE_TEACHER"),
                details.getAuthorities().stream().map(Object::toString).collect(java.util.stream.Collectors.toSet()));
        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("missing@example.com"));
    }

    @Test
    void initializesUsersAndSampleStudentsOnlyWhenNeeded() {
        UserRepository users = mock(UserRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.existsByEmail(anyString())).thenReturn(false);
        when(encoder.encode(anyString())).thenAnswer(invocation -> "encoded:" + invocation.getArgument(0));
        when(students.count()).thenReturn(0L);

        AppInitializer initializer = new AppInitializer(users, encoder, students);
        initializer.init();
        verify(users, times(3)).save(any(User.class));
        verify(students, times(5)).save(any(Student.class));
        verify(encoder, times(3)).encode(anyString());

        when(users.existsByEmail(anyString())).thenReturn(true);
        when(students.count()).thenReturn(5L);
        initializer.init();
        verify(users, times(3)).save(any(User.class));
        verify(students, times(5)).save(any(Student.class));
    }

    @Test
    void handlesMissingEntitiesAsNotFound() {
        ResponseEntity<com.example.student.exception.AppError> response =
                new GlobalExceptionHandler().catchEntityNotFoundException(new EntityNotFoundException("missing"));
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().getStatusCode());
        assertEquals("missing", response.getBody().getMessage());
    }

    @Test
    void configuresPasswordEncoderAndAuthenticationManager() throws Exception {
        SecurityConfiguration configuration = new SecurityConfiguration(null);
        PasswordEncoder encoder = configuration.passwordEncoder();
        String encoded = encoder.encode("secret");
        assertTrue(encoder.matches("secret", encoded));
        assertFalse(encoder.matches("wrong", encoded));

        AuthenticationConfiguration authenticationConfiguration = mock(AuthenticationConfiguration.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        when(authenticationConfiguration.getAuthenticationManager()).thenReturn(authenticationManager);
        assertSame(authenticationManager, configuration.authenticationManager(authenticationConfiguration));
    }
}
