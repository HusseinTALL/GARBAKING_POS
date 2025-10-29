package com.garbaking.orderservice.config;

import com.garbaking.orderservice.websocket.RawOrderWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@RequiredArgsConstructor
public class RawWebSocketConfig implements WebSocketConfigurer {

    private final RawOrderWebSocketHandler rawOrderWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(rawOrderWebSocketHandler, "/ws/orders/raw")
                .setAllowedOriginPatterns("*");
    }
}
