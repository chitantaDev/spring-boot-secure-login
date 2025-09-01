package com.chitanta.springbackend.config;

import com.chitanta.springbackend.token.TokenRepository;
import com.chitanta.springbackend.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

import static com.chitanta.springbackend.helper.Constants.REFRESH_TOKEN;


@Component
@Slf4j
@RequiredArgsConstructor
public class TokenRefreshFilter extends OncePerRequestFilter {
    private final JWTService jwtService;
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String refreshToken = Arrays.stream(cookies)
                .filter(cookie -> REFRESH_TOKEN.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        if (refreshToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                var user = userRepository.findByEmail(userEmail)
                        .orElseThrow();
                if (jwtService.isTokenValid(refreshToken, user)) {
                    // Set authentication context so /me endpoint works
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    // Generate a fresh access token
                    String newAccessToken = jwtService.generateToken(user);
                    
                    // Revoke old tokens and save new one
                    tokenRepository.findAllValidTokensByUser(user.getId())
                            .forEach(token -> {
                                token.setExpired(true);
                                token.setRevoked(true);
                            });
                    tokenRepository.saveAll(tokenRepository.findAllValidTokensByUser(user.getId()));
                    
                    jwtService.saveUserToken(user, newAccessToken);
                    
                    // Set the new access token in response header for frontend to pick up
                    response.setHeader("X-New-Access-Token", newAccessToken);
                }
            } catch (Exception e) {
                log.error("Failed to refresh token for user: {}, error: {}", userEmail, e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}