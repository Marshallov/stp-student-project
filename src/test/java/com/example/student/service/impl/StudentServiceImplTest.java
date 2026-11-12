package com.example.student.service.impl;

import com.example.student.dto.StudentRequest;
import com.example.student.dto.StudentResponse;
import com.example.student.dto.StudentUpdateRequest;
import com.example.student.exception.EntityNotFoundException;
import com.example.student.mapper.StudentMapper;
import com.example.student.model.Student;
import com.example.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentServiceImplTest {
    private StudentRepository repository;
    private StudentMapper mapper;
    private StudentServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(StudentRepository.class);
        mapper = mock(StudentMapper.class);
        service = new StudentServiceImpl(repository, mapper);
    }

    @Test
    void savesAndMapsStudent() {
        StudentRequest request = new StudentRequest();
        Student student = new Student();
        Student saved = new Student();
        when(mapper.requestToStudent(request)).thenReturn(student);
        when(repository.save(student)).thenReturn(saved);
        StudentResponse response = new StudentResponse(1L, "Ada", "Lovelace");
        when(mapper.studentToResponse(saved)).thenReturn(response);

        assertSame(response, service.save(request));
        verify(repository).save(student);
    }

    @Test
    void findsStudentAndMapsList() {
        Student student = new Student();
        when(repository.findById(7L)).thenReturn(Optional.of(student));
        when(mapper.studentToFullResponse(student)).thenReturn(null);
        assertNull(service.findById(7L));

        when(repository.findAll()).thenReturn(List.of(student));
        when(mapper.studentListToStudentResponseList(List.of(student))).thenReturn(null);
        assertNull(service.findAll());
    }

    @Test
    void throwsForMissingStudent() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        EntityNotFoundException error = assertThrows(EntityNotFoundException.class, () -> service.findById(99L));
        assertEquals("Student with ID 99 not found!", error.getMessage());
    }

    @Test
    void updatesOnlyProvidedFields() {
        Student student = new Student();
        student.setEmail("old@example.com");
        student.setPhoneNumber("111");
        when(repository.findById(1L)).thenReturn(Optional.of(student));
        when(repository.save(student)).thenReturn(student);
        when(mapper.studentToResponse(student)).thenReturn(new StudentResponse());

        assertNotNull(service.update(1L, new StudentUpdateRequest(null, "new@example.com")));
        assertEquals("new@example.com", student.getEmail());
        assertEquals("111", student.getPhoneNumber());

        assertNotNull(service.update(1L, new StudentUpdateRequest("222", "new@example.com")));
        assertEquals("new@example.com", student.getEmail());
        assertEquals("222", student.getPhoneNumber());
    }

    @Test
    void updateMissingStudentAndDelete() {
        when(repository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.update(2L, new StudentUpdateRequest()));
        service.deleteById(3L);
        verify(repository).deleteById(3L);
    }
}
