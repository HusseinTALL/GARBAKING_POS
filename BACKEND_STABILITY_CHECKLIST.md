# Backend Stability - Quick Reference Checklist

## CRITICAL ISSUES (Must Fix Before Production)

### Security & Configuration
- [ ] **Move hardcoded database credentials to environment variables**
  - File: All service `application.yml` files (user-service, order-service, etc.)
  - Variables: `DB_USER`, `DB_PASSWORD`
  - Priority: CRITICAL

- [ ] **Change default JWT secret**
  - Current: `your-256-bit-secret-key-for-jwt-signing-change-this-in-production`
  - Impact: Anyone can forge valid tokens
  - Priority: CRITICAL

### Database Stability
- [ ] **Add HikariCP connection pool configuration**
  - Add to all services:
    ```yaml
    datasource:
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
        max-lifetime: 1800000
        connection-timeout: 20000
    ```
  - Impact: Prevent connection pool exhaustion
  - Priority: HIGH

- [ ] **Disable SQL query logging**
  - Set `show-sql: false` in all services
  - Impact: Performance improvement, reduce log bloat
  - Priority: HIGH

### Application Stability
- [ ] **Add graceful shutdown configuration**
  - File: All service `application.yml` files
  - Add:
    ```yaml
    server:
      shutdown: graceful
    spring:
      lifecycle:
        timeout-per-shutdown-phase: 30s
    ```
  - Impact: Prevent data loss during shutdown
  - Priority: HIGH

- [ ] **Add request timeout configuration**
  - Add to all services:
    ```yaml
    server:
      tomcat:
        connection-timeout: 20000
    ```
  - Impact: Prevent hanging requests
  - Priority: HIGH

### Health & Monitoring
- [ ] **Create custom health indicators**
  - Implement for: Database, Kafka, Eureka registration
  - Impact: Orchestration systems can detect unhealthy services
  - Priority: HIGH

- [ ] **Add Kafka error handling**
  - Implement DLQ (Dead Letter Queue)
  - Add retry logic
  - File: `KafkaOrderEventListener.java`, `InventoryAuditListener.java`
  - Priority: HIGH

### Resilience
- [ ] **Implement circuit breaker pattern**
  - Add dependency: `io.github.resilience4j:resilience4j-spring-boot2`
  - For inter-service REST calls
  - Impact: Prevent cascading failures
  - Priority: HIGH

---

## HIGH PRIORITY ISSUES (Phase 1 - Week 1)

- [ ] **Implement database migrations (Flyway or Liquibase)**
  - Current risk: `ddl-auto: update` is unsafe
  - File: New migration files in `db/migration/`
  - Priority: HIGH

- [ ] **Add authorization audit logging**
  - Log: API access, data modifications, failed auth attempts
  - Create: `AuditInterceptor` or `AuditFilter`
  - Priority: HIGH

- [ ] **Implement gateway-wide rate limiting**
  - Add to API Gateway
  - Currently only on QR endpoints
  - Priority: HIGH

- [ ] **Fix hardcoded user ID in QR Payment**
  - File: `order-service/.../QRPaymentController.java:393`
  - Change from: `return 1L;`
  - To: Extract from authentication principal
  - Priority: MEDIUM

- [ ] **Add distributed trace correlation IDs**
  - For request tracing across services
  - Use Spring Cloud Sleuth
  - Priority: MEDIUM

---

## MEDIUM PRIORITY ISSUES (Phase 2 - Week 2-3)

### Logging
- [ ] **Add centralized log aggregation**
  - Implement: ELK Stack (Elasticsearch, Logstash, Kibana)
  - Currently: Logs only to console
  - Priority: MEDIUM

- [ ] **Add log file rotation**
  - Currently: Only console output
  - Add: File appenders with rotation
  - Priority: MEDIUM

### Monitoring
- [ ] **Add database operation metrics**
  - Micrometer metrics for JPA queries
  - Track slow queries
  - Priority: MEDIUM

- [ ] **Create operational runbook**
  - Document: Common failure scenarios
  - Document: Recovery procedures
  - Priority: MEDIUM

### Error Handling
- [ ] **Improve error response format**
  - Add: Error codes, timestamps, request IDs
  - Currently: Generic "Internal Server Error"
  - Priority: LOW-MEDIUM

---

## LOW PRIORITY ISSUES (Phase 3 - Future)

- [ ] **Implement service mesh (Istio)**
  - For advanced traffic management
  - Priority: LOW

- [ ] **Add chaos engineering tests**
  - Test failure scenarios
  - Priority: LOW

- [ ] **Implement canary deployments**
  - Gradual rollout strategy
  - Priority: LOW

- [ ] **Add API versioning strategy**
  - For backward compatibility
  - Priority: LOW

- [ ] **Implement secrets management (Vault)**
  - For production secrets
  - Priority: LOW

---

## CONFIGURATION SNIPPETS

### 1. HikariCP Connection Pool (Add to each service's application.yml)
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      max-lifetime: 1800000  # 30 minutes
      idle-timeout: 600000   # 10 minutes
      connection-timeout: 20000  # 20 seconds
      auto-commit: true
      leak-detection-threshold: 60000  # 1 minute
```

### 2. Graceful Shutdown (Add to each service's application.yml)
```yaml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

### 3. Request Timeout (Add to each service's application.yml)
```yaml
server:
  tomcat:
    connection-timeout: 20000
    threads:
      max: 200
      min-spare: 10
```

### 4. Environment Variables (For credentials)
```bash
# In docker-compose.yml or deployment scripts
SPRING_DATASOURCE_USERNAME=${DB_USER}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET_KEY}
```

### 5. Kafka DLQ Configuration (Add to order-service)
```yaml
spring:
  kafka:
    producer:
      retries: 3
    consumer:
      max-poll-records: 10
```

---

## TESTING CHECKLIST

Before declaring "production ready":

- [ ] **Load Test**: Simulate 100+ concurrent users
- [ ] **Database Failover**: Disconnect DB, verify graceful degradation
- [ ] **Kafka Downtime**: Stop Kafka, verify error handling
- [ ] **Service Restart**: Kill random services, verify recovery
- [ ] **Network Latency**: Add 500ms latency, verify timeouts work
- [ ] **Memory Leak Test**: Run for 24 hours, monitor memory usage
- [ ] **Database Connection Pool**: Verify pool exhaustion handling

---

## METRICS TO MONITOR (Once Implemented)

Key metrics to set alerts on:

1. **Database Connections**
   - Alert if > 18 (max is 20)
   - Alert if connection wait time > 5s

2. **HTTP Requests**
   - Alert if error rate > 1%
   - Alert if p95 latency > 5s

3. **Kafka**
   - Alert if consumer lag > 1000
   - Alert if broker down

4. **Application Health**
   - Alert if service down (health != UP)
   - Alert if GC pauses > 1s

5. **API Gateway**
   - Alert if routing errors > 0.1%
   - Alert if auth failures > 10/minute

---

## DEPLOYMENT REQUIREMENTS

Before deploying to production:

- [ ] All services have graceful shutdown
- [ ] Database has automatic backups
- [ ] Secrets are encrypted
- [ ] Logging is centralized
- [ ] Monitoring is configured
- [ ] Alerting is active
- [ ] Runbooks are documented
- [ ] Load testing passed
- [ ] Security audit completed
- [ ] Disaster recovery plan created

---

## Files to Modify

### Phase 1 (Week 1)
1. **All service `application.yml` files**
   - Add: HikariCP config
   - Add: Graceful shutdown
   - Add: Request timeouts
   - Remove: Hardcoded credentials
   - Change: show-sql to false

2. **`docker-compose.yml`**
   - Add: Environment variables for credentials

3. **Create: Custom Health Indicators**
   - `user-service/config/HealthConfig.java`
   - `order-service/config/HealthConfig.java`
   - etc.

4. **Update: Kafka Listeners**
   - `order-service/service/KafkaOrderEventListener.java`
   - `inventory-service/service/InventoryAuditListener.java`
   - Add: DLQ + retry logic

### Phase 2
1. **Create: Database migrations**
   - `db/migration/V1__initial_schema.sql`

2. **Create: Audit logging**
   - `common-libs/config/AuditConfig.java`

3. **Update: API Gateway**
   - Add: Rate limiting configuration

---

## Command Reference

### Check for Critical Issues
```bash
# Find hardcoded passwords
grep -r "password:" garbaking-backend/*/src/main/resources/*.yml

# Find SQL logging enabled
grep -r "show-sql: true" garbaking-backend/*/src/main/resources/*.yml

# Find missing health configs
grep -r "hikari\|shutdown\|connection-timeout" garbaking-backend/*/src/main/resources/*.yml
```

### Verify Fixes
```bash
# Test service startup with new config
cd garbaking-backend/user-service
./gradlew bootRun

# Check health endpoint
curl http://localhost:8081/actuator/health

# Check Prometheus metrics
curl http://localhost:8081/actuator/prometheus
```

---

## Success Criteria

After implementing all critical and high-priority issues:

1. ✅ All services startup gracefully
2. ✅ Health endpoints report all dependencies
3. ✅ No hanging requests after timeout period
4. ✅ Database credentials from environment
5. ✅ Kafka failures don't cause data loss
6. ✅ Service failures don't cascade
7. ✅ Graceful shutdown in 30 seconds
8. ✅ Database connection pool never exhausted
9. ✅ All services have audit logs
10. ✅ Load test passes (100+ concurrent users)

---

**Last Updated**: November 15, 2025
**Target: Production Ready Date**: December 15, 2025
