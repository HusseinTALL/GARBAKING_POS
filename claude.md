# Claude.md – Garbaking POS Development Guide

This document serves as the **single source of truth** for developing the Garbaking POS project with AI assistance. It outlines the **project scope, progress, workflow, and prompting structure** to ensure clarity and alignment at every step.

------

## 📝 Project Overview

**Project Name:** Garbaking POS System
**Type:** Full Stack Point of Sale Application
**Stack:** Vue 3 + TypeScript + Vite + TailwindCSS + Node.js/Express + Prisma + SQLite/PostgreSQL
**Goal:** Build a modern, offline-first Point of Sale system for restaurants and food service businesses. The system includes customer ordering, admin management, kitchen display, and hardware integration with thermal printers and Raspberry Pi deployment.
**Key Features:** Offline-first design, multi-interface system (customer/admin/kitchen), real-time order tracking, thermal printing, payment processing, analytics dashboard, PWA capabilities  

------

## ✅ Progress Tracker

| Phase                             | Status | Notes                                                      |
| --------------------------------- | ------ | ---------------------------------------------------------- |
| **Phase 1: Requirements & SRS**   | ✅     | Complete - README.md with full project requirements       |
| **Phase 2: System Design**        | ✅     | Complete - Multi-app architecture with Vue 3 + Node.js   |
| **Phase 3: Frontend Scaffolding** | ✅     | Complete - 3 Vue apps: admin-pos, customer-app, kds      |
| **Phase 4: Backend Scaffolding**  | ✅     | Complete - Express API with TypeScript and Prisma         |
| **Phase 5: Integration**          | ✅     | Complete - All apps running, API connected, auth working  |
| **Phase 6: Core Features**        | 🔄     | In Progress - Menu system operational, UI features next   |
| **Phase 7: Testing & QA**         | ☐      | Pending - Test frameworks configured but tests needed     |
| **Phase 8: Deployment**           | 🔄     | Partial - Docker setup complete, dependency fixes needed  |

> **Instructions**: Check off completed phases and add notes on progress or blockers. Update this table after each milestone.

------

## 🔄 Development Workflow

1. **Identify Current Phase**: Reference the Progress Tracker to focus on the active phase.  
2. **Craft a Prompt**: Use the Prompt Template below to request specific outputs from the AI.  
3. **Store Outputs**: Save generated code, diagrams, or docs in the appropriate project folder (e.g., `/docs`, `/frontend`).  
4. **Update This File**: Log progress, decisions, and next steps in the relevant sections.  
5. **Review and Iterate**: Validate outputs, test functionality, and refine as needed.

------

## 🧩 Prompt Template

Use this structure to create clear, actionable prompts for AI assistance:

**Context**  

- **Current Phase**: [e.g., Phase 3 – Frontend Scaffolding]  
- **What’s Done**: [e.g., SRS completed, see `/docs/srs.md`]  
- **What’s Needed**: [e.g., PostgreSQL schema with tables and relationships]

**Request**
Please [action: generate, explain, refactor, design] [deliverable: e.g., code, diagram, documentation] in [language/format: e.g., TypeScript, Mermaid, Markdown].  

**Constraints**  

- [e.g., Use TailwindCSS for styling, follow RESTful API conventions, ensure TypeScript compatibility]  
- [e.g., Provide full code snippets with comments, include error handling]  
- **Mandatory**: Include a comment block at the top of every file or codebase describing its purpose and functionality in 2–4 lines.

**Example Prompt**  

```yaml
Context:
  Current Phase: Phase 3 – Frontend Scaffolding
  What’s Done: DB schema and API contracts in /docs
  What’s Needed: A landing page with a responsive navbar and dashboard
Request:
  Please generate a Next.js + TypeScript + TailwindCSS landing page with a responsive navbar, sidebar, and dashboard layout.
Constraints:
  - Use TailwindCSS for styling
  - Ensure mobile responsiveness
  - Provide full code with a comment block at the top describing the file’s purpose and functionality in 2–4 lines
  - Include inline comments for clarity
```

------

## 📂 Project Structure

Current organization:

- `/docs` → Architecture diagrams, API contracts, this `claude.md`, README.md
- `/frontend` → Vue 3 applications (admin-pos, customer-app, kds, shared)
- `/backend` → Node.js/Express + TypeScript + Prisma ORM
- `/hardware` → Raspberry Pi setup scripts and configurations
- `/docker` → Container configurations for deployment
- `/tests` → Unit tests (Vitest), E2E tests (Playwright)
- Root files → Static HTML prototypes (pos.html, customer.html, etc.)

------

## 🚀 Current Status

- **Current Phase**: Phase 6 – Core Features Development
- **Last Completed**: Full integration - Backend, Admin, and Customer apps running with authentication
- **Next Step**: Implement core menu management UI and real-time order features
- **Services Running**:
  - Backend API: `http://localhost:3001` ✅
  - Admin POS: `http://localhost:3000` ✅
  - Customer App: `http://localhost:3002` ✅
- **Working Features**: User registration, login, JWT auth, menu API, sample data

------

## 🛠 Example Prompts by Phase

- **Phase 1 – Requirements**:
  “Based on the Project Overview, generate a detailed Software Requirements Specification (SRS) in Markdown, including functional and non-functional requirements.”  
- **Phase 2 – System Design**:
  “Design a PostgreSQL schema for the app with tables, fields, data types, and relationships. Provide a Mermaid ER diagram and SQL code with a comment block describing the schema’s purpose.”  
- **Phase 3 – Frontend Scaffolding**:
  “Generate a Next.js + TypeScript + TailwindCSS landing page with a responsive navbar, sidebar, and dashboard layout. Include a comment block at the top describing the file’s purpose and functionality.”  
- **Phase 4 – Backend Scaffolding**:
  “Create an Express.js + TypeScript REST API with Prisma for [entities]. Include routes, models, a comment block at the top describing the file’s purpose, and inline comments for clarity.”  
- **Phase 5 – Integration**:
  “Write TypeScript service functions in Next.js to connect to the backend API endpoints. Include a comment block at the top describing the file’s purpose and examples for GET and POST requests.”  
- **Phase 6 – Core Features**:
  “Implement user authentication (login/signup) with JWT in Express.js and a React frontend form with TailwindCSS. Include comment blocks at the top of each file describing their purpose.”  
- **Phase 7 – Testing**:
  “Generate Jest unit tests for the Express.js API endpoints and Cypress E2E tests for the Next.js frontend. Include comment blocks describing each test file’s purpose.”  
- **Phase 8 – Deployment**:
  “Provide a step-by-step guide to deploy the Next.js frontend to Vercel and the Express.js backend to Render, including GitHub Actions for CI/CD. Include a comment block in any scripts describing their purpose.”

------

## 📌 Notes & Decisions Log

- [2025-09-22] – Project uses Vue 3 + Vite instead of Next.js for faster development.
- [2025-09-22] – Prisma ORM chosen for TypeScript integration with SQLite/PostgreSQL.
- [2025-09-22] – Issue: `escpos-network@^3.0.0-alpha.6` dependency not found, blocking npm installs.
- [2025-09-22] – Workaround: Static HTML prototypes working via Python HTTP server on port 3333.
- [2025-09-22] – Architecture: Multi-app approach with separate customer, admin, and kitchen interfaces.

> **Instructions**: Log key decisions, issues, and resolutions to maintain alignment between AI and human contributors.

------

## 🛠 Additional Guidelines

- **Code Comments**: Every file or codebase must include a comment block at the top (2–4 lines) describing its purpose and functionality. Inline comments should be used to explain complex logic.  
- **Version Control**: Use Git with clear commit messages (e.g., `feat: add user auth endpoint`, `fix: resolve navbar responsiveness`).  
- **Testing Strategy**: Aim for >80% test coverage. Prioritize unit tests for backend logic and E2E tests for critical user flows.  
- **Scalability**: Design APIs and DB schemas with future growth in mind (e.g., sharding, indexing).  
- **AI Usage**: Always validate AI-generated code for security, performance, and adherence to the comment block requirement before merging.