package com.garbaking.orderservice.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RawOrderWebSocketHandlerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private ObjectMapper objectMapper;

    @InjectMocks
    private RawOrderWebSocketHandler handler;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        handler = new RawOrderWebSocketHandler(messagingTemplate, objectMapper);
    }

    @Test
    void forwardsMessagesToSimpDestination() throws Exception {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("abc");
        when(session.isOpen()).thenReturn(true);

        handler.afterConnectionEstablished(session);
        handler.handleTextMessage(session, new TextMessage("{\"destination\":\"/topic/orders\",\"orderId\":1}"));

        verify(messagingTemplate).convertAndSend(eq("/topic/orders"), any());
        verify(session).sendMessage(any(TextMessage.class));
    }

    @Test
    void broadcastSendsPayloadToAllSessions() throws Exception {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("sess1");
        when(session.isOpen()).thenReturn(true);

        handler.afterConnectionEstablished(session);
        handler.broadcast(Map.of("orderNumber", "ORD-1"));

        verify(session).sendMessage(any(TextMessage.class));

        handler.afterConnectionClosed(session, CloseStatus.NORMAL);
        handler.broadcast(Map.of("orderNumber", "ORD-2"));

        verifyNoMoreInteractions(session);
    }
}
