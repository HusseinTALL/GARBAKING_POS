package com.garbaking.userservice.service;

import com.garbaking.userservice.dto.AuthResponse;
import com.garbaking.userservice.dto.LoginRequest;
import com.garbaking.userservice.dto.UserDTO;
import com.garbaking.userservice.exception.ResourceNotFoundException;
import com.garbaking.userservice.exception.UserAlreadyExistsException;
import com.garbaking.userservice.model.User;
import com.garbaking.userservice.repository.UserRepository;
import com.garbaking.userservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User Service
 *
 * Business logic for user management, authentication, and JWT generation.
 * NOTE: Running in standalone mode without Kafka event publishing
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(UserDTO userDTO) {
        log.info("Registering new user with email: {}", userDTO.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + userDTO.getEmail() + " already exists");
        }

        // Create new user
        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRole(userDTO.getRole() != null ? userDTO.getRole() : User.UserRole.CUSTOMER);
        user.setPhone(userDTO.getPhone());
        user.setActive(true);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Generate JWT access token
        String token = jwtUtil.generateToken(savedUser);

        // Generate refresh token
        String refreshToken = refreshTokenService.createRefreshToken(savedUser).getToken();

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(convertToDTO(savedUser))
                .message("User registered successfully")
                .build();
    }

    /**
     * Authenticate user and generate JWT token
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Login attempt for email: {}", loginRequest.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        // Check if user is active
        if (!user.isActive()) {
            throw new IllegalStateException("User account is inactive");
        }

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        log.info("User logged in successfully: {}", user.getId());

        // Generate JWT access token
        String token = jwtUtil.generateToken(user);

        // Generate refresh token
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(convertToDTO(user))
                .message("Login successful")
                .build();
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }

    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(String email) {
        log.info("Fetching user with email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return convertToDTO(user);
    }

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(User.UserRole role) {
        log.info("Fetching users with role: {}", role);
        return userRepository.findByRole(role).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update user
     */
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        log.info("Updating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Update fields
        if (userDTO.getName() != null) {
            user.setName(userDTO.getName());
        }
        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new UserAlreadyExistsException("Email already in use");
            }
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }
        if (userDTO.getRole() != null) {
            user.setRole(userDTO.getRole());
        }
        if (userDTO.isActive() != user.isActive()) {
            user.setActive(userDTO.isActive());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getId());

        return convertToDTO(updatedUser);
    }

    /**
     * Delete user (soft delete by deactivating)
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(false);
        userRepository.save(user);

        log.info("User deleted (deactivated) successfully: {}", id);
    }

    /**
     * Hard delete user (for admin purposes)
     */
    @Transactional
    public void hardDeleteUser(Long id) {
        log.info("Hard deleting user with ID: {}", id);

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
        log.info("User hard deleted successfully: {}", id);
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        log.info("Refreshing access token");

        // Verify and get refresh token
        User user = refreshTokenService.getUserFromRefreshToken(refreshToken);

        // Generate new access token
        String newAccessToken = jwtUtil.generateToken(user);

        log.info("Access token refreshed for user: {}", user.getEmail());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken) // Return same refresh token
                .user(convertToDTO(user))
                .message("Token refreshed successfully")
                .build();
    }

    /**
     * Logout user by revoking refresh token
     */
    @Transactional
    public void logout(String refreshToken) {
        log.info("Logging out user");

        try {
            refreshTokenService.revokeRefreshToken(refreshToken);
            log.info("User logged out successfully");
        } catch (Exception e) {
            log.warn("Logout attempt with invalid token: {}", e.getMessage());
            // Don't throw - logout should be idempotent
        }
    }

    /**
     * Logout from all devices by revoking all user's refresh tokens
     */
    @Transactional
    public void logoutAll(Long userId) {
        log.info("Logging out user from all devices: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        refreshTokenService.revokeAllUserTokens(user);
        log.info("User logged out from all devices: {}", user.getEmail());
    }

    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
