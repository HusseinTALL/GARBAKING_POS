package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.InventoryAuditDTO;
import com.garbaking.inventoryservice.dto.InventoryAuditRequest;
import com.garbaking.inventoryservice.model.Category;
import com.garbaking.inventoryservice.model.MenuItem;
import com.garbaking.inventoryservice.repository.CategoryRepository;
import com.garbaking.inventoryservice.repository.InventoryAuditRepository;
import com.garbaking.inventoryservice.repository.MenuItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@SpringBootTest
@ActiveProfiles("test")
class InventoryAuditIntegrationTest {

    @Autowired
    private MenuItemService menuItemService;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private InventoryAuditRepository inventoryAuditRepository;

    @MockBean
    private InventoryEventPublisher inventoryEventPublisher;
    @MockBean
    private ImageStorageService imageStorageService;

    @Test
    void performInventoryAuditUpdatesQuantityAndSavesAudit() {
        Category category = categoryRepository.save(Category.builder()
                .name("Beverages")
                .build());
        MenuItem menuItem = menuItemRepository.save(MenuItem.builder()
                .name("Flat White")
                .price(BigDecimal.valueOf(4.50))
                .category(category)
                .stockQuantity(4)
                .isAvailable(true)
                .isActive(true)
                .build());

        InventoryAuditRequest request = new InventoryAuditRequest();
        request.setMenuItemId(menuItem.getId());
        request.setCountedQuantity(9);
        request.setReason("Cycle count");
        request.setPerformedBy("inventory-admin");

        InventoryAuditDTO audit = menuItemService.performInventoryAudit(request);

        MenuItem reloaded = menuItemRepository.findById(menuItem.getId()).orElseThrow();
        assertThat(reloaded.getStockQuantity()).isEqualTo(9);
        assertThat(reloaded.getIsAvailable()).isTrue();
        assertThat(inventoryAuditRepository.findById(audit.getId())).isPresent();

        verify(inventoryEventPublisher).publishStockAdjustment(any());
        verify(inventoryEventPublisher).publishInventoryAudit(any());
    }
}
