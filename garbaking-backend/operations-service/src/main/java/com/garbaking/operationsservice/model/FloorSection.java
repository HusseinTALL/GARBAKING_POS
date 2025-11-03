package com.garbaking.operationsservice.model;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorSection {

    private Long id;
    private String name;
    @Builder.Default
    private List<DiningTable> tables = new ArrayList<>();
}
