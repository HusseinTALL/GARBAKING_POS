package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.PrinterDevice;
import com.garbaking.operationsservice.model.PrinterStatus;
import com.garbaking.operationsservice.model.ReceiptType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrinterDeviceRepository extends JpaRepository<PrinterDevice, Long> {
    
    List<PrinterDevice> findByLocation(String location);
    
    List<PrinterDevice> findByPrinterType(ReceiptType printerType);
    
    List<PrinterDevice> findByStatus(PrinterStatus status);
    
    List<PrinterDevice> findByEnabled(boolean enabled);
    
    Optional<PrinterDevice> findByNameAndLocation(String name, String location);
}
