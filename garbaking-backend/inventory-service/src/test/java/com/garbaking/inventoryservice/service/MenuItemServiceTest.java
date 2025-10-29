package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.InventoryAuditDTO;
import com.garbaking.inventoryservice.dto.StockAdjustmentDTO;
import com.garbaking.inventoryservice.event.InventoryAuditEvent;
import com.garbaking.inventoryservice.event.StockAdjustmentEvent;
import com.garbaking.inventoryservice.exception.InvalidStockAdjustmentException;
import com.garbaking.inventoryservice.exception.ResourceNotFoundException;
import com.garbaking.inventoryservice.model.InventoryAuditSource;
import com.garbaking.inventoryservice.model.MenuItem;
import com.garbaking.inventoryservice.repository.CategoryRepository;
import com.garbaking.inventoryservice.repository.MenuItemImageRepository;
import com.garbaking.inventoryservice.repository.MenuItemRepository;
import com.garbaking.inventoryservice.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuItemServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private MenuItemImageRepository menuItemImageRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private InventoryAuditService inventoryAuditService;
    @Mock
    private InventoryEventPublisher inventoryEventPublisher;
    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private MenuItemService menuItemService;

    private MenuItem menuItem;

    @BeforeEach
    void setUp() {
        menuItem = MenuItem.builder()
                .id(1L)
                .name("Latte")
                .price(BigDecimal.TEN)
                .stockQuantity(10)
                .isAvailable(true)
                .isActive(true)
                .build();
    }

    @Test
    void adjustStock_whenReducingWithoutReasonThrows() {
        StockAdjustmentDTO dto = StockAdjustmentDTO.builder()
                .menuItemId(1L)
                .quantity(-2)
                .build();
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));

        assertThatThrownBy(() -> menuItemService.adjustStock(dto))
                .isInstanceOf(InvalidStockAdjustmentException.class)
                .hasMessageContaining("Reason is required");
    }

    @Test
    void adjustStock_publishesEventsAndUpdatesQuantity() {
        StockAdjustmentDTO dto = StockAdjustmentDTO.builder()
                .menuItemId(1L)
                .quantity(-4)
                .reason("Order fulfillment")
                .performedBy("order-service")
                .build();
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryAuditService.recordStockAdjustment(any(MenuItem.class), anyInt(), anyInt(), any(), any(), any()))
                .thenReturn(InventoryAuditDTO.builder()
                        .id(42L)
                        .menuItemId(1L)
                        .menuItemName("Latte")
                        .changeQuantity(-4)
                        .previousQuantity(10)
                        .newQuantity(6)
                        .source(InventoryAuditSource.INVENTORY_SERVICE)
                        .build());

        menuItemService.adjustStock(dto);

        ArgumentCaptor<MenuItem> savedCaptor = ArgumentCaptor.forClass(MenuItem.class);
        verify(menuItemRepository).save(savedCaptor.capture());
        assertThat(savedCaptor.getValue().getStockQuantity()).isEqualTo(6);
        assertThat(savedCaptor.getValue().getIsAvailable()).isTrue();

        verify(inventoryAuditService).recordStockAdjustment(any(MenuItem.class), eq(-4), eq(10), eq("Order fulfillment"),
                eq(InventoryAuditSource.INVENTORY_SERVICE), eq("order-service"));
        verify(inventoryEventPublisher).publishStockAdjustment(any(StockAdjustmentEvent.class));
        verify(inventoryEventPublisher).publishInventoryAudit(any(InventoryAuditEvent.class));
    }

    @Test
    void adjustStock_whenMenuItemMissingThrows() {
        when(menuItemRepository.findById(99L)).thenReturn(Optional.empty());
        StockAdjustmentDTO dto = StockAdjustmentDTO.builder()
                .menuItemId(99L)
                .quantity(5)
                .reason("Restock")
                .build();

        assertThatThrownBy(() -> menuItemService.adjustStock(dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
