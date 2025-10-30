package com.garbaking.userservice.bootstrap;

import com.garbaking.userservice.model.User;
import com.garbaking.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/**
 * Seeds the user database with a handful of demo accounts so the dashboard
 * and authentication flows have realistic data to work with.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SampleDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("User repository empty, loading sample users…");

        List<User> users = List.of(
                User.builder()
                        .name("Amelia Baker")
                        .email("amelia.baker@garbaking.com")
                        .password(passwordEncoder.encode("password123"))
                        .phone("+226 70 01 23 45")
                        .role(User.UserRole.ADMIN)
                        .active(true)
                        .storeId("GARBAKING_MAIN")
                        .build(),
                User.builder()
                        .name("Noah Clerk")
                        .email("noah.clerk@garbaking.com")
                        .password(passwordEncoder.encode("password123"))
                        .phone("+226 70 98 76 54")
                        .role(User.UserRole.CASHIER)
                        .active(true)
                        .storeId("GARBAKING_MAIN")
                        .build(),
                User.builder()
                        .name("Lina Chef")
                        .email("lina.chef@garbaking.com")
                        .password(passwordEncoder.encode("password123"))
                        .phone("+226 70 11 22 33")
                        .role(User.UserRole.KITCHEN)
                        .active(true)
                        .storeId("GARBAKING_MAIN")
                        .build(),
                User.builder()
                        .name("Oumar Customer")
                        .email("oumar.customer@garbaking.com")
                        .password(passwordEncoder.encode("password123"))
                        .phone("+226 70 55 44 33")
                        .role(User.UserRole.CUSTOMER)
                        .active(true)
                        .storeId("GARBAKING_MAIN")
                        .build()
        );

        userRepository.saveAll(users);
        log.info("Seeded {} demo users", users.size());
    }
}
