package com.garbaking.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Rate Limit Filter
 *
 * Applies rate limiting to authentication endpoints.
 * Rejects requests that exceed configured rate limits with HTTP 429 (Too Many Requests).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String ipAddress = getClientIP(request);

        // Check rate limits for authentication endpoints
        if (requestURI.contains("/api/auth/login")) {
            if (!rateLimitService.isLoginAllowed(ipAddress)) {
                handleRateLimitExceeded(response, "login", ipAddress);
                return;
            }
            rateLimitService.recordLoginAttempt(ipAddress);
        } else if (requestURI.contains("/api/auth/register")) {
            if (!rateLimitService.isRegisterAllowed(ipAddress)) {
                handleRateLimitExceeded(response, "registration", ipAddress);
                return;
            }
            rateLimitService.recordRegisterAttempt(ipAddress);
        } else if (requestURI.contains("/api/auth/refresh")) {
            if (!rateLimitService.isRefreshAllowed(ipAddress)) {
                handleRateLimitExceeded(response, "token refresh", ipAddress);
                return;
            }
            rateLimitService.recordRefreshAttempt(ipAddress);
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Handle rate limit exceeded
     */
    private void handleRateLimitExceeded(HttpServletResponse response, String operation, String ipAddress) throws IOException {
        log.warn("Rate limit exceeded for {} from IP: {}", operation, ipAddress);

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String jsonResponse = String.format(
                "{\"error\":\"Too many requests\",\"message\":\"Rate limit exceeded for %s. Please try again later.\",\"status\":429}",
                operation
        );

        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }

    /**
     * Get client IP address from request
     * Checks common proxy headers first
     */
    private String getClientIP(HttpServletRequest request) {
        // Check for proxy headers (in order of preference)
        String[] headerNames = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "HTTP_VIA",
                "REMOTE_ADDR"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For can contain multiple IPs, take the first one
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        // Fall back to remote address
        return request.getRemoteAddr();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only filter authentication endpoints
        String path = request.getRequestURI();
        return !path.startsWith("/api/auth");
    }
}
