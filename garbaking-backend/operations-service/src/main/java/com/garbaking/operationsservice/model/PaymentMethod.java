package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @Column(length = 20)
    private String code;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentMethodStatus status;

    @Column(name = "supports_tips")
    private boolean supportsTips;
}
