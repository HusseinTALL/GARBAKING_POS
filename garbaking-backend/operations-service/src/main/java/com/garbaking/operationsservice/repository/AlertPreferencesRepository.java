package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.AlertPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlertPreferencesRepository extends JpaRepository<AlertPreferences, Long> {

    /**
     * Find global preferences (userId is null)
     */
    Optional<AlertPreferences> findByUserIdIsNull();

    /**
     * Find preferences for specific user
     */
    Optional<AlertPreferences> findByUserId(Long userId);
}
