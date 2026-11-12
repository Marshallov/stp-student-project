package com.example.student.security;

import com.example.student.model.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtServiceAndFilterTest {
    private final JwtService jwtService = new JwtService();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void generatesAndValidatesTokenClaims() {
        String token = jwtService.generateToken("admin@example.com", Set.of(Role.ADMIN, Role.TEACHER));
        assertEquals("admin@example.com", jwtService.extractUsername(token));
        assertEquals(Set.of(Role.ADMIN, Role.TEACHER), jwtService.extractRoles(token));

        UserDetails matching = org.springframework.security.core.userdetails.User
                .withUsername("admin@example.com").password("hash").authorities("ROLE_ADMIN").build();
        UserDetails different = org.springframework.security.core.userdetails.User
                .withUsername("other@example.com").password("hash").authorities("ROLE_ADMIN").build();
        assertTrue(jwtService.validateToken(token, matching));
        assertFalse(jwtService.validateToken(token, different));
        assertThrows(RuntimeException.class, () -> jwtService.extractUsername("not-a-token"));
    }

    @Test
    void passesRequestsWithoutBearerTokenThrough() throws Exception {
        UserDetailsService users = mock(UserDetailsService.class);
        JwtFilter filter = new JwtFilter(users, jwtService);
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);
        verify(chain).doFilter(request, response);
        verifyNoInteractions(users);

        when(request.getHeader("Authorization")).thenReturn("Basic credentials");
        filter.doFilterInternal(request, response, chain);
        verify(chain, times(2)).doFilter(request, response);
    }

    @Test
    void authenticatesValidBearerToken() throws Exception {
        UserDetails user = org.springframework.security.core.userdetails.User
                .withUsername("admin@example.com").password("hash").authorities("ROLE_ADMIN").build();
        UserDetailsService users = mock(UserDetailsService.class);
        JwtService jwt = mock(JwtService.class);
        JwtFilter filter = new JwtFilter(users, jwt);
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        when(jwt.extractUsername("token")).thenReturn("admin@example.com");
        when(users.loadUserByUsername("admin@example.com")).thenReturn(user);
        when(jwt.validateToken("token", user)).thenReturn(true);

        filter.doFilterInternal(request, response, chain);
        assertInstanceOf(UsernamePasswordAuthenticationToken.class,
                SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void skipsExistingAuthenticationAndContinuesForInvalidToken() throws Exception {
        UserDetailsService users = mock(UserDetailsService.class);
        JwtService jwt = mock(JwtService.class);
        JwtFilter filter = new JwtFilter(users, jwt);
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        when(jwt.extractUsername("token")).thenReturn("admin@example.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("already-authenticated", null));
        filter.doFilterInternal(request, response, chain);
        verifyNoInteractions(users);
        verify(chain).doFilter(request, response);

        SecurityContextHolder.clearContext();
        when(users.loadUserByUsername("admin@example.com")).thenReturn(
                org.springframework.security.core.userdetails.User.withUsername("admin@example.com")
                        .password("hash").authorities("ROLE_ADMIN").build());
        when(jwt.validateToken(eq("token"), any())).thenReturn(false);
        filter.doFilterInternal(request, response, chain);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain, times(2)).doFilter(request, response);
    }

    @Test
    void respondsUnauthorizedForApiTokenErrorsAndRethrowsElsewhere() throws Exception {
        UserDetailsService users = mock(UserDetailsService.class);
        JwtService jwt = mock(JwtService.class);
        JwtFilter filter = new JwtFilter(users, jwt);
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid");
        when(request.getRequestURI()).thenReturn("/api/v1/student");
        when(jwt.extractUsername("invalid")).thenThrow(new IllegalArgumentException("bad token"));
        StringWriter body = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(body));

        filter.doFilterInternal(request, response, chain);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json");
        assertTrue(body.toString().contains("bad token"));
        verify(chain, never()).doFilter(request, response);

        when(request.getRequestURI()).thenReturn("/private");
        assertThrows(IllegalArgumentException.class, () -> filter.doFilterInternal(request, response, chain));
    }
}
