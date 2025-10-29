package com.garbaking.orderservice.service;

import com.garbaking.orderservice.dto.OrderDTO;
import com.garbaking.orderservice.dto.UpdateOrderStatusDTO;
import com.garbaking.orderservice.exception.InvalidOrderStateException;
import com.garbaking.orderservice.model.Order;
import com.garbaking.orderservice.repository.OrderItemRepository;
import com.garbaking.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock
    private WebSocketService webSocketService;

    @InjectMocks
    private OrderService orderService;

    private Order existingOrder;

    @BeforeEach
    void setUp() {
        existingOrder = Order.builder()
                .id(1L)
                .orderNumber("ORD-1")
                .status(Order.OrderStatus.PENDING)
                .orderType(Order.OrderType.DINE_IN)
                .userId(5L)
                .subtotal(BigDecimal.TEN)
                .totalAmount(BigDecimal.TEN)
                .paymentStatus(Order.PaymentStatus.PAID)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void updateOrderStatusIsIdempotent() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        UpdateOrderStatusDTO dto = UpdateOrderStatusDTO.builder()
                .status(Order.OrderStatus.PENDING)
                .build();

        OrderDTO result = orderService.updateOrderStatus(1L, dto);

        assertThat(result.getStatus()).isEqualTo(Order.OrderStatus.PENDING);
        verify(orderRepository, never()).save(any());
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    void updateOrderStatusValidatesTransitions() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateOrderStatusDTO dto = UpdateOrderStatusDTO.builder()
                .status(Order.OrderStatus.CONFIRMED)
                .build();

        OrderDTO result = orderService.updateOrderStatus(1L, dto);

        assertThat(result.getStatus()).isEqualTo(Order.OrderStatus.CONFIRMED);
        verify(orderRepository).save(any(Order.class));
        verify(kafkaTemplate).send(anyString(), anyString(), any());
    }

    @Test
    void cancellingWithoutReasonThrowsException() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));

        UpdateOrderStatusDTO dto = UpdateOrderStatusDTO.builder()
                .status(Order.OrderStatus.CANCELLED)
                .build();

        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, dto))
                .isInstanceOf(InvalidOrderStateException.class);
    }
}
