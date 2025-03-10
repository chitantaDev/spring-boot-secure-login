package com.chitanta.springbackend.config;

import com.chitanta.springbackend.token.Token;
import com.chitanta.springbackend.token.TokenRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

import java.util.Arrays;

import static com.chitanta.springbackend.helper.Constants.ACCESS_TOKEN;
import static com.chitanta.springbackend.helper.Constants.REFRESH_TOKEN;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {
    private final TokenRepository tokenRepository;
    private final JWTService jwtService;

    @Override
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        final Cookie[] cookies = request.getCookies();
        if (cookies == null) return;

        String jwt = Arrays.stream(cookies)
                .filter(cookie -> ACCESS_TOKEN.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        if (jwt != null) {
            Token storedToken = tokenRepository.findByToken(jwt).orElse(null);
            if (storedToken != null) {
                storedToken.setExpired(true);
                storedToken.setRevoked(true);
                tokenRepository.save(storedToken);
            }
        }

        // Clear cookies
        response.addHeader("Set-Cookie", jwtService.createEmptyCookie(ACCESS_TOKEN).toString());
        response.addHeader("Set-Cookie", jwtService.createEmptyCookie(REFRESH_TOKEN).toString());
    }
}
