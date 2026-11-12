package com.example.student.mapper;

import com.example.student.controller.AuthController;
import com.example.student.controller.StudentController;
import com.example.student.controller.UserController;
import com.example.student.dto.*;
import com.example.student.dto.user.UserRequest;
import com.example.student.dto.user.UserResponse;
import com.example.student.dto.user.UserResponseList;
import com.example.student.model.Role;
import com.example.student.model.Student;
import com.example.student.model.User;
import com.example.student.security.JwtService;
import com.example.student.service.StudentService;
import com.example.student.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MapperAndControllerTest {
    @Test
    void mapsStudentsAndLists() {
        StudentMapperImpl mapper = new StudentMapperImpl();
        StudentRequest request = new StudentRequest("Ada", "Lovelace", "123", "ada@example.com");
        Student student = mapper.requestToStudent(request);
        assertEquals("Ada", student.getName());
        assertEquals("Lovelace", student.getSurname());
        assertEquals("123", student.getPhoneNumber());
        assertEquals("ada@example.com", student.getEmail());

        student.setId(5L);
        assertEquals("ada@example.com", mapper.studentToFullResponse(student).getEmail());
        assertEquals(5L, mapper.studentToResponse(student).getId());
        assertEquals("Lovelace", mapper.studentToStudentResponseForList(student).getSurname());
        StudentResponseList list = mapper.studentListToStudentResponseList(List.of(student));
        assertEquals(1, list.getTotalCount());
        assertEquals(5L, list.getResponse().getFirst().getId());
        assertEquals(0, mapper.studentListToStudentResponseList(List.of()).getTotalCount());
    }

    @Test
    void mapsUsersAndLists() {
        UserMapperImpl mapper = new UserMapperImpl();
        UserRequest request = new UserRequest("admin@example.com", "password", Set.of(Role.ADMIN));
        User user = mapper.toEntity(request);
        user.setId(3L);
        assertEquals("password", user.getPassword());
        UserResponse response = mapper.toResponse(user);
        assertEquals(3L, response.getId());
        assertEquals(Set.of(Role.ADMIN), response.getRoles());
        UserResponseList list = mapper.toListResponse(List.of(user));
        assertEquals(1, list.getTotalCount());
        assertEquals("admin@example.com", list.getResponses().getFirst().getEmail());
        assertTrue(mapper.toListResponse(List.of()).getResponses().isEmpty());
    }

    @Test
    void delegatesStudentControllerOperations() {
        StudentService service = mock(StudentService.class);
        StudentController controller = new StudentController(service);
        StudentResponseList list = new StudentResponseList(List.of(), 0);
        StudentFullResponse full = new StudentFullResponse();
        StudentResponse response = new StudentResponse();
        when(service.findAll()).thenReturn(list);
        when(service.findById(2L)).thenReturn(full);
        when(service.save(any())).thenReturn(response);
        when(service.update(eq(2L), any())).thenReturn(response);

        assertSame(list, controller.findAll());
        assertSame(full, controller.findStudentById(2L));
        assertSame(full, controller.getFullInfoById(2L));
        assertSame(response, controller.createStudent(new StudentRequest()));
        assertSame(response, controller.updateStudent(2L, new StudentUpdateRequest()));
        controller.deleteStudentById(2L);
        verify(service).deleteById(2L);
    }

    @Test
    void delegatesUserControllerOperations() {
        UserService service = mock(UserService.class);
        UserController controller = new UserController(service);
        UserResponseList list = new UserResponseList(List.of(), 0);
        UserResponse response = new UserResponse();
        when(service.findAll()).thenReturn(list);
        when(service.updateUser(eq(1L), any())).thenReturn(response);
        when(service.save(any())).thenReturn(response);

        assertSame(list, controller.getAllUsers());
        assertSame(response, controller.updateUser(1L, new UserRequest()));
        assertSame(response, controller.save(new UserRequest()));
        controller.deleteById(1L);
        verify(service).deleteById(1L);
    }

    @Test
    void authenticatesAndCreatesBearerToken() {
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        JwtService jwtService = mock(JwtService.class);
        UserDetails user = org.springframework.security.core.userdetails.User
                .withUsername("teacher@example.com")
                .password("hash")
                .authorities(new SimpleGrantedAuthority("ROLE_TEACHER"))
                .build();
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtService.generateToken("teacher@example.com", Set.of(Role.TEACHER))).thenReturn("jwt");

        AuthResponse response = new AuthController(authenticationManager, jwtService)
                .login(new LoginRequest("teacher@example.com", "password"));
        assertEquals("jwt", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals(3600, response.getExpiresIn());
        assertEquals(List.of("ROLE_TEACHER"), response.getRoles());
    }
}
