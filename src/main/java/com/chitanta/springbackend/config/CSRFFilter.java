package com.chitanta.springbackend.config;

import com.chitanta.springbackend.user.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class CSRFFilter extends OncePerRequestFilter {

    private final CSRFService csrfService;

    // Endpoints that don't require CSRF protection (only auth endpoints)
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/api/v1/auth/authenticate",
            "/api/v1/auth/register",
            "/api/v1/auth/logout"
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Skip CSRF check for excluded paths (only auth endpoints)
        if (EXCLUDED_PATHS.contains(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // ALL other requests (GET, POST, PUT, DELETE, etc.) require CSRF protection

        // Get authenticated user (this runs after JWT authentication)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            log.warn("CSRF validation failed: No authenticated user for request {}", requestPath);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\":\"CSRF token validation failed\"}");
            return;
        }

        User user = (User) authentication.getPrincipal();
        String userEmail = user.getEmail();

        // Get CSRF token from header
        String csrfToken = request.getHeader("X-XSRF-TOKEN");
        if (csrfToken == null || csrfToken.isEmpty()) {
            log.warn("CSRF validation failed: Missing CSRF token for user {} on request {}", userEmail, requestPath);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\":\"CSRF token required\"}");
            return;
        }

        // Validate CSRF token
        if (!csrfService.validateCSRFToken(userEmail, csrfToken)) {
            log.warn("CSRF validation failed: Invalid CSRF token for user {} on request {}", userEmail, requestPath);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\":\"Invalid CSRF token\"}");
            return;
        }

        log.debug("CSRF validation successful for user {} on request {}", userEmail, requestPath);
        filterChain.doFilter(request, response);
    }


}
