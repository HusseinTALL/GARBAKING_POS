package com.garbaking.operationsservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiningTable {

    private Long id;
    private String label;
    private int capacity;
    private TableStatus status;
}
