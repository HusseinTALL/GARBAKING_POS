package com.garbaking.inventoryservice.bootstrap;

import com.garbaking.inventoryservice.model.InventoryLocation;
import com.garbaking.inventoryservice.model.ItemCategory;
import com.garbaking.inventoryservice.repository.InventoryLocationRepository;
import com.garbaking.inventoryservice.repository.ItemCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)  // Run after existing data loaders
@Profile("!test")  // Don't run in test environment
public class InventoryDataLoader implements CommandLineRunner {

    private final InventoryLocationRepository locationRepository;
    private final ItemCategoryRepository itemCategoryRepository;

    @Override
    public void run(String... args) {
        log.info("Loading initial inventory data...");

        createLocationsIfNeeded();
        createCategoriesIfNeeded();

        log.info("Initial inventory data loaded successfully");
    }

    private void createLocationsIfNeeded() {
        if (locationRepository.count() == 0) {
            log.info("Creating default inventory locations...");

            InventoryLocation mainStore = InventoryLocation.builder()
                    .locationCode("MAIN-STORE")
                    .name("Main Store")
                    .address("123 Main Street")
                    .isPrimary(true)
                    .isActive(true)
                    .build();

            InventoryLocation warehouse = InventoryLocation.builder()
                    .locationCode("WAREHOUSE-01")
                    .name("Central Warehouse")
                    .address("456 Warehouse Road")
                    .isPrimary(false)
                    .isActive(true)
                    .build();

            locationRepository.saveAll(Arrays.asList(mainStore, warehouse));
            log.info("Created {} locations", 2);
        } else {
            log.info("Locations already exist, skipping...");
        }
    }

    private void createCategoriesIfNeeded() {
        if (itemCategoryRepository.count() == 0) {
            log.info("Creating default item categories...");

            List<ItemCategory> categories = Arrays.asList(
                    ItemCategory.builder()
                            .name("Produce")
                            .description("Fresh fruits and vegetables")
                            .displayOrder(1)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Dairy")
                            .description("Milk, cheese, butter, and dairy products")
                            .displayOrder(2)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Meat & Seafood")
                            .description("Fresh meat, poultry, and seafood")
                            .displayOrder(3)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Baking Supplies")
                            .description("Flour, sugar, and baking ingredients")
                            .displayOrder(4)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Beverages")
                            .description("Coffee, tea, juices, and other beverages")
                            .displayOrder(5)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Spices & Seasonings")
                            .description("Herbs, spices, and seasoning mixes")
                            .displayOrder(6)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Packaging")
                            .description("Cups, bags, boxes, and packaging materials")
                            .displayOrder(7)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Cleaning Supplies")
                            .description("Cleaning products and sanitation items")
                            .displayOrder(8)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Paper Products")
                            .description("Napkins, paper towels, and disposables")
                            .displayOrder(9)
                            .isActive(true)
                            .build(),
                    ItemCategory.builder()
                            .name("Other")
                            .description("Miscellaneous items")
                            .displayOrder(10)
                            .isActive(true)
                            .build()
            );

            itemCategoryRepository.saveAll(categories);
            log.info("Created {} categories", categories.size());
        } else {
            log.info("Categories already exist, skipping...");
        }
    }
}
