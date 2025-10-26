package com.garbaking.discoveryserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Discovery Server - Service Registry using Netflix Eureka
 *
 * This server acts as a service registry where all microservices register themselves.
 * It enables service discovery, allowing services to find and communicate with each other
 * without hardcoding URLs.
 *
 * Dashboard: http://localhost:8761
 */
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
