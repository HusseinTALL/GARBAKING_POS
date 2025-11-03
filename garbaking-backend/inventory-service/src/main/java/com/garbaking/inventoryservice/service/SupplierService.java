package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.dto.SupplierDTO;
import com.garbaking.inventoryservice.exception.ResourceAlreadyExistsException;
import com.garbaking.inventoryservice.exception.ResourceNotFoundException;
import com.garbaking.inventoryservice.model.Supplier;
import com.garbaking.inventoryservice.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages supplier definitions used for replenishment flows.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        supplierRepository.findByNameIgnoreCase(dto.getName())
                .ifPresent(existing -> {
                    throw new ResourceAlreadyExistsException("Supplier with name '" + dto.getName() + "' already exists");
                });
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .contactName(dto.getContactName())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .website(dto.getWebsite())
                .leadTimeDays(dto.getLeadTimeDays())
                .preferred(Boolean.TRUE.equals(dto.getPreferred()))
                .notes(dto.getNotes())
                .build();
        Supplier saved = supplierRepository.save(supplier);
        log.info("Created supplier {}", saved.getId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SupplierDTO> getSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDTO getSupplier(Long id) {
        return supplierRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        if (dto.getName() != null && !dto.getName().equalsIgnoreCase(supplier.getName())) {
            supplierRepository.findByNameIgnoreCase(dto.getName())
                    .ifPresent(existing -> {
                        throw new ResourceAlreadyExistsException("Supplier with name '" + dto.getName() + "' already exists");
                    });
            supplier.setName(dto.getName());
        }
        if (dto.getContactName() != null) supplier.setContactName(dto.getContactName());
        if (dto.getContactEmail() != null) supplier.setContactEmail(dto.getContactEmail());
        if (dto.getContactPhone() != null) supplier.setContactPhone(dto.getContactPhone());
        if (dto.getWebsite() != null) supplier.setWebsite(dto.getWebsite());
        if (dto.getLeadTimeDays() != null) supplier.setLeadTimeDays(dto.getLeadTimeDays());
        if (dto.getPreferred() != null) supplier.setPreferred(dto.getPreferred());
        if (dto.getNotes() != null) supplier.setNotes(dto.getNotes());
        Supplier saved = supplierRepository.save(supplier);
        log.info("Updated supplier {}", id);
        return toDto(saved);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplierRepository.delete(supplier);
        log.info("Deleted supplier {}", id);
    }

    private SupplierDTO toDto(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactName(supplier.getContactName())
                .contactEmail(supplier.getContactEmail())
                .contactPhone(supplier.getContactPhone())
                .website(supplier.getWebsite())
                .leadTimeDays(supplier.getLeadTimeDays())
                .preferred(supplier.getPreferred())
                .notes(supplier.getNotes())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
