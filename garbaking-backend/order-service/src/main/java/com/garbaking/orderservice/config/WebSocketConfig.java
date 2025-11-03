package com.garbaking.orderservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration
 *
 * Configures STOMP over WebSocket for real-time order updates.
 * Clients can subscribe to order updates and receive real-time notifications.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure message broker
     * - /topic for broadcasting to all subscribers
     * - /queue for point-to-point messaging
     * - /app for application destination prefix
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple broker for pub/sub messaging
        registry.enableSimpleBroker("/topic", "/queue");

        // Set application destination prefix for messages bound for @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");

        // Set user destination prefix for user-specific messages
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Register STOMP endpoints
     * - /ws/orders - main WebSocket endpoint
     * - withSockJS() - fallback options for browsers that don't support WebSocket
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/orders")
                .setAllowedOriginPatterns("*")  // Allow all origins (configure properly in production)
                .withSockJS();  // Enable SockJS fallback
    }
}
