# User Service - Integration Tests

This directory contains comprehensive integration tests for the User Service authentication system.

## Test Coverage

### AuthenticationIntegrationTest.java

Complete integration tests covering the entire authentication lifecycle:

1. **Complete Authentication Flow**
   - User registration
   - Login with credentials
   - Token refresh
   - Logout (single device)
   - Token validation

2. **Registration Tests**
   - Successful registration
   - Duplicate email detection (HTTP 409 Conflict)
   - Validation error handling

3. **Login Tests**
   - Successful login
   - Invalid credentials (HTTP 401 Unauthorized)
   - Non-existent user (HTTP 401 Unauthorized)

4. **Token Management**
   - Refresh token generation
   - Access token refresh
   - Token revocation on logout
   - Invalid token handling (HTTP 404 Not Found)

5. **Multi-Device Management**
   - Logout from all devices
   - Multiple refresh tokens per user
   - Token revocation across devices

6. **Input Validation**
   - Invalid email format (HTTP 400 Bad Request)
   - Missing required fields
   - Password length validation

7. **Rate Limiting**
   - Login rate limiting (5 attempts per 15 minutes)
   - Registration rate limiting (3 attempts per hour)
   - HTTP 429 (Too Many Requests) response

8. **Health Checks**
   - Unauthenticated health endpoint access

## Test Configuration

### Test Profile (application-test.yml)

- **Database:** H2 in-memory database (MODE=MySQL for compatibility)
- **Port:** Random port (0) to avoid conflicts
- **Eureka:** Disabled for tests
- **CAPTCHA:** Disabled for tests
- **Rate Limiting:** Enabled (tests verify functionality)
- **JWT Secret:** Test-only secret key
- **Logging:** WARN level for cleaner output

### Test Dependencies

```gradle
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.springframework.security:spring-security-test'
testRuntimeOnly 'com.h2database:h2:2.2.224'
```

## Running Tests

### Run All Tests

```bash
cd garbaking-backend
./gradlew :user-service:test
```

### Run Specific Test Class

```bash
./gradlew :user-service:test --tests AuthenticationIntegrationTest
```

### Run Specific Test Method

```bash
./gradlew :user-service:test --tests AuthenticationIntegrationTest.testCompleteAuthenticationFlow
```

### Run with Detailed Output

```bash
./gradlew :user-service:test --info
```

### Generate Test Report

```bash
./gradlew :user-service:test
# Report will be generated at:
# garbaking-backend/user-service/build/reports/tests/test/index.html
```

## Test Execution Order

Tests are executed in order (using `@Order` annotation) to ensure:
1. Complete flow test runs first (comprehensive validation)
2. Edge cases tested after happy path
3. Rate limiting tests run last (to avoid interference)

## Known Issues & Limitations

### Rate Limiting Tests

Rate limiting tests may interfere with each other if run in parallel. The tests use `@Order` annotations to run sequentially.

**Note:** If rate limiting tests fail:
- Ensure tests are running in order
- Check that rate limiting is enabled in test configuration
- Consider increasing rate limit thresholds for tests

### CAPTCHA Tests

CAPTCHA is disabled in test profile (`captcha.recaptcha.enabled=false`) because:
- Tests don't have valid reCAPTCHA keys
- Network calls to Google would slow down tests
- CAPTCHA logic is tested separately in unit tests

To test CAPTCHA integration:
1. Set valid CAPTCHA keys in environment variables
2. Enable CAPTCHA in test profile
3. Mock or use test reCAPTCHA keys

## Test Best Practices

### Data Cleanup

- `@BeforeEach` method cleans up test data
- `@Transactional` ensures rollback after each test
- H2 database is recreated for each test run

### Test Isolation

Each test is independent and can run in isolation:
- No shared state between tests
- Database reset between tests
- Rate limiting cache is independent per IP

### Assertions

Tests use:
- Spring MockMvc for HTTP calls
- AssertJ for fluent assertions
- JSON path validation for response structure

## Extending Tests

### Adding New Test Cases

1. **Create Test Method:**
```java
@Test
@Order(11)
@DisplayName("Your test description")
void testYourFeature() throws Exception {
    // Test implementation
}
```

2. **Follow Naming Convention:**
   - Method name: `testFeatureName`
   - Display name: Human-readable description

3. **Clean Up After Test:**
   - Use `@BeforeEach` for setup
   - Use `@Transactional` for automatic rollback

### Testing New Endpoints

```java
mockMvc.perform(post("/api/auth/new-endpoint")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.field").value("expected"));
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run Tests
        run: ./gradlew :user-service:test
      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: garbaking-backend/user-service/build/reports/tests/test/
```

## Test Metrics

Target metrics for test quality:
- **Code Coverage:** 80%+ for service layer
- **Test Execution Time:** < 30 seconds
- **Test Success Rate:** 100%
- **Test Maintainability:** Clear, documented, isolated

## Troubleshooting

### Tests Fail with "Address already in use"

**Solution:** Use random port in test profile:
```yaml
server:
  port: 0
```

### Tests Fail with "Database connection error"

**Solution:** Verify H2 is in test dependencies:
```gradle
testRuntimeOnly 'com.h2database:h2:2.2.224'
```

### Rate Limiting Tests Fail

**Solution:**
1. Ensure tests run sequentially (not in parallel)
2. Check rate limit configuration in application-test.yml
3. Clear rate limit cache between test runs

### "Bean not found" Errors

**Solution:**
1. Verify `@SpringBootTest` annotation is present
2. Check `@AutoConfigureMockMvc` for web tests
3. Ensure all required beans are created in test context

## Future Enhancements

- [ ] Add performance tests (load testing)
- [ ] Add tests for concurrent requests
- [ ] Add tests for token expiration scenarios
- [ ] Add tests for password reset flow (when implemented)
- [ ] Add tests for 2FA (when implemented)
- [ ] Add mutation testing (PIT)
- [ ] Add contract tests (Pact)

## Resources

- [Spring Boot Testing Documentation](https://spring.io/guides/gs/testing-web/)
- [MockMvc Documentation](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/web/servlet/MockMvc.html)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [AssertJ Documentation](https://assertj.github.io/doc/)
