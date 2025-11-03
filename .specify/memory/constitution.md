<!--
Sync Impact Report - Constitution Update
Version change: 1.0.0 → 1.0.0 (Initial Constitution)
Modified principles: New constitution created with 5 core principles
Added sections: Core Principles, Technical Standards, Development Workflow, Governance
Removed sections: None (new constitution)
Templates requiring updates: All templates are compatible with new constitution
Follow-up TODOs: None
-->

# Garbaking POS Constitution

## Core Principles

### I. Offline-First Architecture
Every feature MUST function without internet connectivity for core operations. Data synchronization is eventual, not immediate. Local SQLite databases serve as the source of truth for restaurant operations. The system MUST handle network failures gracefully and queue operations for sync when connectivity returns.

**Rationale**: Restaurant operations cannot halt due to internet outages. Food service requires reliable, immediate responses for order taking and kitchen operations.

### II. Multi-Interface Consistency (NON-NEGOTIABLE)
All interfaces (customer-app, admin-pos, kds) MUST maintain data consistency through shared backend APIs. Real-time updates via WebSocket ensure synchronized state across all connected clients. No interface-specific data silos are permitted.

**Rationale**: Inconsistent order states between customer, staff, and kitchen systems lead to operational failures and customer dissatisfaction.

### III. TypeScript-First Development
All new code MUST be written in TypeScript with strict type checking enabled. Comment blocks describing purpose and functionality are MANDATORY at the top of every file (2-4 lines). Runtime type validation is required for all external data (API requests, user input, hardware interfaces).

**Rationale**: Restaurant POS systems handle financial transactions and inventory. Type safety prevents costly runtime errors in production environments.

### IV. Hardware Integration Standards
All hardware components (thermal printers, payment terminals, kitchen displays) MUST have abstracted interfaces with fallback modes. Hardware failures cannot block software operations. ESC/POS printer commands MUST be tested on physical hardware before deployment.

**Rationale**: Restaurant hardware fails frequently and must be replaceable without software changes. Operations continue even when specific hardware components are offline.

### V. Test-Driven Development for Critical Paths
Order processing, payment handling, and inventory updates MUST have comprehensive test coverage (>90%). Tests MUST be written before implementation for all financial and operational features. Integration tests are required for all hardware interfaces.

**Rationale**: Financial and operational errors in restaurant systems have immediate business impact. Critical paths must be thoroughly validated before deployment.

## Technical Standards

### Performance Requirements
- Order processing: < 2 seconds end-to-end
- UI responsiveness: < 100ms for all user interactions
- Database queries: < 50ms for menu/order operations
- Print job completion: < 3 seconds
- Offline operation: 8+ hours without connectivity

### Security Standards
- JWT authentication for all API endpoints
- Input validation and sanitization on all user inputs
- PCI compliance for payment processing
- Local database encryption for customer data
- HTTPS required for all external communications

### Technology Stack Constraints
- Frontend: Vue 3 + TypeScript + Vite + TailwindCSS only
- Backend: Node.js + Express + TypeScript + Prisma only
- Database: SQLite (local) + PostgreSQL (cloud) only
- Real-time: Socket.io only
- Hardware: ESC/POS compatible printers only

## Development Workflow

### Phase-Based Development
Development follows the 8-phase structure defined in CLAUDE.md. Each phase must be completed and validated before proceeding to the next. Progress tracking is maintained in the CLAUDE.md Progress Tracker.

### Code Review Requirements
- All PRs must include TypeScript compilation without errors
- All new features require corresponding tests
- Hardware integration changes require physical device testing
- Performance benchmarks must be maintained for critical paths

### Documentation Standards
- API changes require contract documentation updates
- Hardware setup procedures must be validated on real devices
- User-facing changes require update to user manuals
- All configuration changes documented in deployment guides

## Governance

### Amendment Process
Constitution changes require documentation of impact on existing code, update of dependent templates, and version increment following semantic versioning. Major changes require validation against existing project phases and feature specifications.

### Versioning Policy
- MAJOR: Backward incompatible changes to architecture or tech stack
- MINOR: New principles or expanded technical requirements
- PATCH: Clarifications, documentation updates, typo fixes

### Compliance Review
All development work must verify compliance with these principles. Architecture decisions that violate principles require explicit justification and approval. Regular audits ensure ongoing adherence to offline-first and multi-interface consistency requirements.

**Version**: 1.0.0 | **Ratified**: 2025-10-26 | **Last Amended**: 2025-10-26