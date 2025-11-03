package com.garbaking.inventoryservice.bootstrap;

import com.garbaking.inventoryservice.model.Category;
import com.garbaking.inventoryservice.model.MenuItem;
import com.garbaking.inventoryservice.model.Supplier;
import com.garbaking.inventoryservice.repository.CategoryRepository;
import com.garbaking.inventoryservice.repository.MenuItemRepository;
import com.garbaking.inventoryservice.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the inventory database with a curated set of categories, menu items,
 * and suppliers so the POS dashboards have meaningful data out of the box.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SampleDataLoader implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        log.info("Inventory repository empty, loading sample categories and menu items…");

        Category pastries = categoryRepository.save(
                Category.builder()
                        .name("Artisan Pastries")
                        .description("Freshly baked croissants, brioches and viennoiseries")
                        .color("#F59E0B")
                        .displayOrder(1)
                        .isActive(true)
                        .build()
        );

        Category sandwiches = categoryRepository.save(
                Category.builder()
                        .name("Signature Sandwiches")
                        .description("Garbaking favourites prepared with homemade breads")
                        .color("#10B981")
                        .displayOrder(2)
                        .isActive(true)
                        .build()
        );

        Category beverages = categoryRepository.save(
                Category.builder()
                        .name("Hot & Cold Beverages")
                        .description("Specialty coffees, fresh juices and comforting drinks")
                        .color("#3B82F6")
                        .displayOrder(3)
                        .isActive(true)
                        .build()
        );

        Supplier dairySupplier = supplierRepository.save(
                Supplier.builder()
                        .name("La Ferme Beurre")
                        .contactName("Marie Dubois")
                        .contactEmail("marie@lafermebeurre.com")
                        .contactPhone("+226 70 20 40 10")
                        .website("https://lafermebeurre.example")
                        .leadTimeDays(2)
                        .preferred(true)
                        .notes("Delivers premium butter and cream every Monday and Thursday")
                        .build()
        );

        Supplier coffeeSupplier = supplierRepository.save(
                Supplier.builder()
                        .name("Café Doux Afrique")
                        .contactName("Adama Koffi")
                        .contactEmail("adama@cafedoux.africa")
                        .contactPhone("+226 70 33 22 55")
                        .website("https://cafedoux.africa")
                        .leadTimeDays(5)
                        .preferred(true)
                        .notes("Single-origin beans roasted weekly; call for seasonal blends")
                        .build()
        );

        // Build menu items
        MenuItem croissant = MenuItem.builder()
                .name("Classic Butter Croissant")
                .description("Layers of laminated dough baked to golden perfection with AOP butter.")
                .sku("CRS-001")
                .price(new BigDecimal("3.50"))
                .costPrice(new BigDecimal("1.20"))
                .category(pastries)
                .stockQuantity(120)
                .lowStockThreshold(30)
                .unit("piece")
                .preparationTime(12)
                .calories(320)
                .ingredients("Flour, cultured butter, milk, yeast, sugar, salt")
                .isFeatured(true)
                .displayOrder(1)
                .createdAt(LocalDateTime.now().minusDays(10))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();
        croissant.addSupplier(dairySupplier);

        MenuItem painChocolat = MenuItem.builder()
                .name("Pain au Chocolat")
                .description("Flaky pastry enveloping premium dark chocolate sticks.")
                .sku("CRS-002")
                .price(new BigDecimal("3.80"))
                .costPrice(new BigDecimal("1.40"))
                .category(pastries)
                .stockQuantity(90)
                .lowStockThreshold(25)
                .unit("piece")
                .preparationTime(14)
                .calories(360)
                .ingredients("Flour, butter, chocolate, eggs, sugar, yeast")
                .displayOrder(2)
                .createdAt(LocalDateTime.now().minusDays(9))
                .updatedAt(LocalDateTime.now().minusHours(12))
                .build();
        painChocolat.addSupplier(dairySupplier);

        MenuItem turkeySandwich = MenuItem.builder()
                .name("Roasted Turkey Baguette")
                .description("Sourdough baguette filled with roasted turkey, caramelised onions and herb mayo.")
                .sku("SND-101")
                .price(new BigDecimal("8.90"))
                .costPrice(new BigDecimal("3.60"))
                .category(sandwiches)
                .stockQuantity(45)
                .lowStockThreshold(10)
                .unit("sandwich")
                .preparationTime(6)
                .calories(540)
                .ingredients("Sourdough bread, turkey breast, onions, arugula, herb mayo")
                .displayOrder(1)
                .createdAt(LocalDateTime.now().minusDays(7))
                .updatedAt(LocalDateTime.now().minusHours(6))
                .build();

        MenuItem veggiePanini = MenuItem.builder()
                .name("Mediterranean Veggie Panini")
                .description("Grilled ciabatta with marinated vegetables, feta cheese and pesto.")
                .sku("SND-105")
                .price(new BigDecimal("7.80"))
                .costPrice(new BigDecimal("3.10"))
                .category(sandwiches)
                .stockQuantity(38)
                .lowStockThreshold(8)
                .unit("sandwich")
                .preparationTime(5)
                .calories(480)
                .ingredients("Ciabatta, zucchini, bell peppers, eggplant, feta, pesto")
                .displayOrder(2)
                .createdAt(LocalDateTime.now().minusDays(6))
                .updatedAt(LocalDateTime.now().minusHours(4))
                .build();

        MenuItem latte = MenuItem.builder()
                .name("Vanilla Bean Latte")
                .description("Double espresso with steamed milk, Madagascar vanilla and microfoam art.")
                .sku("BEV-210")
                .price(new BigDecimal("4.60"))
                .costPrice(new BigDecimal("1.05"))
                .category(beverages)
                .stockQuantity(200)
                .lowStockThreshold(40)
                .unit("cup")
                .preparationTime(3)
                .calories(190)
                .ingredients("Espresso, milk, vanilla syrup")
                .isFeatured(true)
                .displayOrder(1)
                .createdAt(LocalDateTime.now().minusDays(8))
                .updatedAt(LocalDateTime.now().minusHours(2))
                .build();
        latte.addSupplier(coffeeSupplier);

        MenuItem hibiscusIcedTea = MenuItem.builder()
                .name("Hibiscus Iced Tea")
                .description("Refreshing infusion of hibiscus petals, orange zest and mint over ice.")
                .sku("BEV-305")
                .price(new BigDecimal("3.90"))
                .costPrice(new BigDecimal("0.90"))
                .category(beverages)
                .stockQuantity(150)
                .lowStockThreshold(35)
                .unit("cup")
                .preparationTime(2)
                .calories(80)
                .ingredients("Hibiscus petals, orange zest, mint, cane sugar")
                .displayOrder(2)
                .createdAt(LocalDateTime.now().minusDays(5))
                .updatedAt(LocalDateTime.now().minusHours(3))
                .build();

        menuItemRepository.saveAll(
                List.of(croissant, painChocolat, turkeySandwich, veggiePanini, latte, hibiscusIcedTea)
        );

        log.info("Seeded {} categories and {} menu items", categoryRepository.count(), menuItemRepository.count());
    }
}
