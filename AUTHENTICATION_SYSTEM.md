# Authentication System with Refresh Tokens

## Overview

Implemented a complete JWT-based authentication system with refresh tokens for the Garbaking POS microservices backend.

## Features

✅ **Access Tokens** (JWT)
- Short-lived (24 hours)
- Used for API authentication
- Contains user info (id, email, role)
- Signed with HS256 algorithm

✅ **Refresh Tokens**
- Long-lived (7 days)
- Stored in database
- Used to obtain new access tokens
- Can be revoked (logout)
- Limited to 5 active tokens per user

✅ **Token Revocation**
- Logout from single device
- Logout from all devices
- Automatic cleanup of expired tokens
- Token blacklist via revocation flag

✅ **Security Features**
- Password hashing with BCrypt
- Token expiration validation
- Revoked token detection
- Maximum tokens per user limit

## Architecture

### Components Created

1. **RefreshToken Entity** (`model/RefreshToken.java`)
   - Stores refresh tokens in database
   - Tracks expiration and revocation status
   - Links to User entity

2. **RefreshTokenRepository** (`repository/RefreshTokenRepository.java`)
   - JPA repository for token CRUD
   - Custom queries for validation
   - Bulk revocation operations

3. **RefreshTokenService** (`service/RefreshTokenService.java`)
   - Token generation logic
   - Token validation and verification
   - Revocation management
   - Cleanup utilities

4. **DTOs**
   - `AuthResponse` - Updated with refreshToken field
   - `RefreshTokenRequest` - For refresh endpoint
   - `LogoutRequest` - For logout endpoint

5. **Auth Endpoints** (`controller/AuthController.java`)
   - `POST /api/auth/register` - Register + get tokens
   - `POST /api/auth/login` - Login + get tokens
   - `POST /api/auth/refresh` - Refresh access token
   - `POST /api/auth/logout` - Logout (revoke refresh token)
   - `POST /api/auth/logout-all/{userId}` - Logout all devices

## API Documentation

### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+123456789",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "active": true
  },
  "message": "User registered successfully"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Refresh Access Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  },
  "message": "Token refreshed successfully"
}
```

### Logout (Single Device)

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Logout All Devices

```http
POST /api/auth/logout-all/1
```

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

## Database Schema

### refresh_tokens Table

```sql
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry (expiry_date),
    INDEX idx_revoked (revoked)
);
```

## Configuration

### application.yml

```yaml
jwt:
  secret: your-256-bit-secret-key-for-jwt-signing-change-this-in-production
  expiration: 86400000  # 24 hours in milliseconds
  refresh:
    expiration: 604800000  # 7 days in milliseconds
    max-per-user: 5  # Maximum active refresh tokens per user
```

### Security Considerations

1. **Secret Key**
   - Change default secret in production
   - Use 256-bit or longer key
   - Store in environment variables

2. **Token Expiration**
   - Access tokens: 24 hours (adjust based on security needs)
   - Refresh tokens: 7 days (balance security vs UX)

3. **Token Limits**
   - Max 5 refresh tokens per user
   - Prevents token accumulation
   - Auto-revokes oldest when limit reached

4. **HTTPS Required**
   - Always use HTTPS in production
   - Prevents token interception

## Usage Examples

### Frontend Integration (JavaScript/TypeScript)

```typescript
// Store tokens
interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Login
async function login(email: string, password: string): Promise<AuthTokens> {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const data = await response.json()

  // Store tokens securely
  localStorage.setItem('access_token', data.token)
  localStorage.setItem('refresh_token', data.refreshToken)
  localStorage.setItem('user', JSON.stringify(data.user))

  return {
    accessToken: data.token,
    refreshToken: data.refreshToken
  }
}

// Refresh token
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token')

  const response = await fetch('http://localhost:8080/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })

  const data = await response.json()

  // Update access token
  localStorage.setItem('access_token', data.token)

  return data.token
}

// Logout
async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token')

  await fetch('http://localhost:8080/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })

  // Clear local storage
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshAccessToken()
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
```

## Token Lifecycle

### Normal Flow

```
1. User logs in
   ├─> Generate access token (24h)
   └─> Generate refresh token (7d)

2. User makes API calls
   └─> Use access token in Authorization header

3. Access token expires (after 24h)
   └─> Frontend detects 401 error
   └─> Calls /api/auth/refresh with refresh token
   └─> Gets new access token
   └─> Retries original request

4. User logs out
   └─> Revoke refresh token
   └─> Clear tokens from frontend
```

### Security Flow

```
Refresh Token Validation:
├─> Check if token exists in database
├─> Check if token is revoked
├─> Check if token is expired
└─> If all pass: generate new access token
    If any fail: throw error (user must login)

Logout:
├─> Find refresh token in database
├─> Set revoked = true
└─> Set revokedAt = now()

Logout All:
├─> Find all user's refresh tokens
├─> Set all to revoked = true
└─> User must login on all devices
```

## Maintenance

### Cleanup Job (Recommended)

Add a scheduled task to clean up expired tokens:

```java
@Scheduled(cron = "0 0 2 * * *") // Run daily at 2 AM
public void cleanupExpiredTokens() {
    refreshTokenService.deleteExpiredTokens();
}
```

### Monitoring

Key metrics to monitor:
- Active refresh tokens per user
- Token refresh rate
- Failed refresh attempts
- Logout frequency
- Expired token cleanup stats

## Error Handling

### Common Errors

1. **Invalid Refresh Token** (404)
   - Token doesn't exist in database
   - Action: User must login again

2. **Expired Refresh Token** (400)
   - Token has passed expiry date
   - Action: User must login again

3. **Revoked Refresh Token** (400)
   - Token has been logged out
   - Action: User must login again

4. **Max Tokens Exceeded** (auto-handled)
   - User reaches 5 token limit
   - Action: Auto-revoke oldest tokens

## Files Modified/Created

### New Files
1. `user-service/src/main/java/com/garbaking/userservice/model/RefreshToken.java`
2. `user-service/src/main/java/com/garbaking/userservice/repository/RefreshTokenRepository.java`
3. `user-service/src/main/java/com/garbaking/userservice/service/RefreshTokenService.java`
4. `user-service/src/main/java/com/garbaking/userservice/dto/RefreshTokenRequest.java`
5. `user-service/src/main/java/com/garbaking/userservice/dto/LogoutRequest.java`

### Modified Files
1. `user-service/src/main/java/com/garbaking/userservice/dto/AuthResponse.java` - Added refreshToken field
2. `user-service/src/main/java/com/garbaking/userservice/service/UserService.java` - Added refresh/logout methods
3. `user-service/src/main/java/com/garbaking/userservice/controller/AuthController.java` - Added refresh/logout endpoints
4. `user-service/src/main/resources/application.yml` - Added JWT refresh config

## Testing

### Manual Testing

```bash
# 1. Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'

# Save tokens from response

# 2. Refresh token
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token_from_step_1>"
  }'

# 3. Logout
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token_from_step_1>"
  }'

# 4. Try to refresh after logout (should fail)
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token_from_step_1>"
  }'
```

## Next Steps

1. ✅ Implemented refresh token system
2. ✅ Added logout functionality
3. ⏭️ Update frontend apps to use refresh tokens
4. ⏭️ Implement automatic token refresh in frontends
5. ⏭️ Add token cleanup scheduled job
6. ⏭️ Add monitoring/metrics
7. ⏭️ Security audit

## Production Checklist

- [ ] Change JWT secret key
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Add rate limiting on auth endpoints
- [ ] Implement CAPTCHA for register/login
- [ ] Add account lockout after failed attempts
- [ ] Set up monitoring alerts
- [ ] Add token cleanup scheduled job
- [ ] Review token expiration times
- [ ] Test token rotation
- [ ] Document API for frontend team
