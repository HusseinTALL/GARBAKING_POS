package com.garbaking.inventoryservice.event;

import com.garbaking.inventoryservice.dto.MenuItemDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Event describing lifecycle changes to a menu item entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemLifecycleEvent {
    private String type;
    private MenuItemDTO payload;
    private Instant occurredAt;
}
