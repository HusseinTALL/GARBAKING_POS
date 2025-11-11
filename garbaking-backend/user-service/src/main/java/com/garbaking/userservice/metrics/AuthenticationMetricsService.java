package com.garbaking.userservice.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Authentication Metrics Service
 *
 * Collects and exposes metrics for authentication operations:
 * - Login success/failure counts
 * - Registration counts
 * - Token refresh counts
 * - Rate limit violations
 * - Active sessions
 * - Authentication latency
 *
 * Metrics are exposed via Prometheus endpoint at /actuator/prometheus
 */
@Service
@Slf4j
public class AuthenticationMetricsService {

    // Counters
    private final Counter loginSuccessCounter;
    private final Counter loginFailureCounter;
    private final Counter registrationSuccessCounter;
    private final Counter registrationFailureCounter;
    private final Counter tokenRefreshSuccessCounter;
    private final Counter tokenRefreshFailureCounter;
    private final Counter rateLimitViolationsCounter;
    private final Counter logoutCounter;

    // Gauges (current values)
    private final AtomicLong activeSessionsGauge;
    private final AtomicLong activeRefreshTokensGauge;

    // Timers (for latency)
    private final Timer loginLatency;
    private final Timer registrationLatency;
    private final Timer tokenRefreshLatency;

    public AuthenticationMetricsService(MeterRegistry registry) {
        // Initialize counters
        this.loginSuccessCounter = Counter.builder("auth.login.success")
                .description("Number of successful login attempts")
                .tag("service", "user-service")
                .register(registry);

        this.loginFailureCounter = Counter.builder("auth.login.failure")
                .description("Number of failed login attempts")
                .tag("service", "user-service")
                .register(registry);

        this.registrationSuccessCounter = Counter.builder("auth.registration.success")
                .description("Number of successful user registrations")
                .tag("service", "user-service")
                .register(registry);

        this.registrationFailureCounter = Counter.builder("auth.registration.failure")
                .description("Number of failed user registrations")
                .tag("service", "user-service")
                .register(registry);

        this.tokenRefreshSuccessCounter = Counter.builder("auth.token.refresh.success")
                .description("Number of successful token refreshes")
                .tag("service", "user-service")
                .register(registry);

        this.tokenRefreshFailureCounter = Counter.builder("auth.token.refresh.failure")
                .description("Number of failed token refreshes")
                .tag("service", "user-service")
                .register(registry);

        this.rateLimitViolationsCounter = Counter.builder("auth.rate_limit.violations")
                .description("Number of rate limit violations")
                .tag("service", "user-service")
                .register(registry);

        this.logoutCounter = Counter.builder("auth.logout.total")
                .description("Total number of logout operations")
                .tag("service", "user-service")
                .register(registry);

        // Initialize gauges
        this.activeSessionsGauge = new AtomicLong(0);
        Gauge.builder("auth.sessions.active", activeSessionsGauge, AtomicLong::get)
                .description("Number of currently active sessions")
                .tag("service", "user-service")
                .register(registry);

        this.activeRefreshTokensGauge = new AtomicLong(0);
        Gauge.builder("auth.refresh_tokens.active", activeRefreshTokensGauge, AtomicLong::get)
                .description("Number of active refresh tokens")
                .tag("service", "user-service")
                .register(registry);

        // Initialize timers
        this.loginLatency = Timer.builder("auth.login.latency")
                .description("Login operation latency")
                .tag("service", "user-service")
                .register(registry);

        this.registrationLatency = Timer.builder("auth.registration.latency")
                .description("Registration operation latency")
                .tag("service", "user-service")
                .register(registry);

        this.tokenRefreshLatency = Timer.builder("auth.token.refresh.latency")
                .description("Token refresh operation latency")
                .tag("service", "user-service")
                .register(registry);

        log.info("Authentication metrics service initialized");
    }

    // Counter methods
    public void recordLoginSuccess() {
        loginSuccessCounter.increment();
        log.debug("Recorded login success");
    }

    public void recordLoginFailure() {
        loginFailureCounter.increment();
        log.debug("Recorded login failure");
    }

    public void recordRegistrationSuccess() {
        registrationSuccessCounter.increment();
        log.debug("Recorded registration success");
    }

    public void recordRegistrationFailure() {
        registrationFailureCounter.increment();
        log.debug("Recorded registration failure");
    }

    public void recordTokenRefreshSuccess() {
        tokenRefreshSuccessCounter.increment();
        log.debug("Recorded token refresh success");
    }

    public void recordTokenRefreshFailure() {
        tokenRefreshFailureCounter.increment();
        log.debug("Recorded token refresh failure");
    }

    public void recordRateLimitViolation() {
        rateLimitViolationsCounter.increment();
        log.debug("Recorded rate limit violation");
    }

    public void recordLogout() {
        logoutCounter.increment();
        log.debug("Recorded logout");
    }

    // Gauge methods
    public void setActiveSessions(long count) {
        activeSessionsGauge.set(count);
    }

    public void incrementActiveSessions() {
        activeSessionsGauge.incrementAndGet();
    }

    public void decrementActiveSessions() {
        activeSessionsGauge.decrementAndGet();
    }

    public void setActiveRefreshTokens(long count) {
        activeRefreshTokensGauge.set(count);
    }

    // Timer methods
    public Timer.Sample startLoginTimer() {
        return Timer.start();
    }

    public void recordLoginLatency(Timer.Sample sample) {
        sample.stop(loginLatency);
    }

    public Timer.Sample startRegistrationTimer() {
        return Timer.start();
    }

    public void recordRegistrationLatency(Timer.Sample sample) {
        sample.stop(registrationLatency);
    }

    public Timer.Sample startTokenRefreshTimer() {
        return Timer.start();
    }

    public void recordTokenRefreshLatency(Timer.Sample sample) {
        sample.stop(tokenRefreshLatency);
    }
}
