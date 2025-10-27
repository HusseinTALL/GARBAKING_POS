package com.garbaking.userservice.repository;

import com.garbaking.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * User Repository
 *
 * Provides database operations for User entity using Spring Data JPA.
 * Custom query methods use Spring Data JPA naming conventions.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email (used for login)
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by email (for registration validation)
     */
    boolean existsByEmail(String email);

    /**
     * Find all users by role
     */
    List<User> findByRole(User.UserRole role);

    /**
     * Find all active users
     */
    List<User> findByActiveTrue();

    /**
     * Find users by store ID
     */
    List<User> findByStoreId(String storeId);

    /**
     * Custom query: Find active users by role and store
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.storeId = :storeId AND u.active = true")
    List<User> findActiveUsersByRoleAndStore(User.UserRole role, String storeId);
}
