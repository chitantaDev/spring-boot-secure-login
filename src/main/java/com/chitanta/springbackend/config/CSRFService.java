package com.chitanta.springbackend.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class CSRFService {

    @Value("${application.security.csrf.secret-key}")
    private String CSRF_SECRET_KEY;

    @Value("${application.security.csrf.expiration}")
    private long csrfExpiration; // Default: 30 minutes

    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentHashMap<String, Long> csrfTokens = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public CSRFService() {
        // Clean up expired tokens every 5 minutes
        scheduler.scheduleAtFixedRate(this::cleanupExpiredTokens, 5, 5, TimeUnit.MINUTES);
    }

    /**
     * Generate a new CSRF token for a user session
     */
    public String generateCSRFToken(String userEmail) {
        // Generate random token
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String randomToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        // Create HMAC signature
        String signature = createHMACSignature(userEmail + ":" + randomToken);
        
        // Combine token with signature
        String csrfToken = randomToken + "." + signature;
        
        // Store token with expiration
        csrfTokens.put(csrfToken, System.currentTimeMillis() + csrfExpiration);
        
        return csrfToken;
    }

    /**
     * Validate CSRF token
     */
    public boolean validateCSRFToken(String userEmail, String csrfToken) {
        if (csrfToken == null || csrfToken.isEmpty()) {
            return false;
        }

        // Check if token exists and is not expired (atomic operation)
        Long expirationTime = csrfTokens.computeIfPresent(csrfToken, (key, value) -> {
            if (System.currentTimeMillis() > value) {
                return null; // Remove expired token
            }
            return value; // Keep valid token
        });
        
        if (expirationTime == null) {
            return false; // Token doesn't exist or was expired
        }

        // Split token and signature
        String[] parts = csrfToken.split("\\.", 2);
        if (parts.length != 2) {
            return false;
        }

        String randomToken = parts[0];
        String providedSignature = parts[1];

        // Verify signature
        String expectedSignature = createHMACSignature(userEmail + ":" + randomToken);
        return expectedSignature.equals(providedSignature);
    }

    /**
     * Create CSRF token cookie
     */
    public ResponseCookie createCSRFCookie(String csrfToken) {
        return ResponseCookie.from("XSRF-TOKEN", csrfToken)
                .httpOnly(false) // Frontend needs to read this
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(csrfExpiration / 1000) // Convert to seconds
                .build();
    }

    /**
     * Create empty CSRF cookie for logout
     */
    public ResponseCookie createEmptyCSRFCookie() {
        return ResponseCookie.from("XSRF-TOKEN", "")
                .httpOnly(false)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
    }

    /**
     * Revoke CSRF token (on logout)
     */
    public void revokeCSRFToken(String csrfToken) {
        csrfTokens.remove(csrfToken);
    }

    /**
     * Create HMAC signature for token validation
     */
    private String createHMACSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    CSRF_SECRET_KEY.getBytes(StandardCharsets.UTF_8), 
                    "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] signature = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to create HMAC signature", e);
        }
    }

    /**
     * Clean up expired tokens
     */
    private void cleanupExpiredTokens() {
        long currentTime = System.currentTimeMillis();
        csrfTokens.entrySet().removeIf(entry -> entry.getValue() < currentTime);
    }
}
