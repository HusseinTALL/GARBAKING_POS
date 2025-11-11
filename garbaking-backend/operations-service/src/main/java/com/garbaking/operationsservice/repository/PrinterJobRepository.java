package com.garbaking.operationsservice.repository;

import com.garbaking.operationsservice.model.PrinterJob;
import com.garbaking.operationsservice.model.PrinterJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrinterJobRepository extends JpaRepository<PrinterJob, Long> {
    
    List<PrinterJob> findByPrinterId(Long printerId);
    
    List<PrinterJob> findByStatus(PrinterJobStatus status);
    
    List<PrinterJob> findByPrinterIdAndStatus(Long printerId, PrinterJobStatus status);
    
    List<PrinterJob> findByReceiptId(Long receiptId);
    
    List<PrinterJob> findByPrinterIdOrderByPriorityDescEnqueuedAtAsc(Long printerId);
}
