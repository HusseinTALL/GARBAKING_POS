# Design Specification for Admin POS UI

This document provides a comprehensive, developer-ready specification for implementing the Admin POS (Point of Sale) UI based on the provided screenshot. The UI appears to be a desktop-oriented restaurant ordering system with a clean, modern design. Assumptions are made for exact pixel values, colors, and fonts where not explicitly measurable from the screenshot (e.g., using common UI standards like Material Design or Bootstrap equivalents). Measurements are in pixels (px) for precision, with rem equivalents noted where scalable (assuming 1rem = 16px). Use this spec to implement in code (e.g., HTML/CSS/React) or design tools (e.g., Figma/Adobe XD).

The overall theme is light-mode with blue accents, sans-serif typography, and card-based layouts for menu items. Export assets (icons, images) as SVG/PNG for scalability.

## Layout & Structure

- **Screen Dimensions**: Full viewport width (recommended minimum 1280px for desktop). Screenshot suggests ~1440px width x ~900px height. Use flexbox or CSS Grid for responsiveness.
- **Overall Grid**: 3-column layout with fixed left sidebar, flexible main content, and fixed right sidebar.
  - Left Sidebar: 240px width, full height (minus header), background #F8F9FA (light gray).
  - Main Content: Flexible width (~70% of remaining space), padding: 24px (1.5rem).
  - Right Sidebar (Order Summary): 320px width, full height (minus header), background #FFFFFF, with subtle left border (1px solid #DEE2E6).
- **Header**: Fixed top bar, 64px height, background #FFFFFF, box-shadow: 0 2px 4px rgba(0,0,0,0.05).
  - Logo/Icon: Left-aligned, 32px x 32px purple hexagon icon, margin-left: 16px.
  - Title ("Admin POS"): 20px bold, left-aligned next to logo.
  - Tabs: Centered, pill-style buttons (Dine In selected with blue underline/dot). Each tab: 120px width, 40px height, margin: 0 8px.
  - User Profile: Right-aligned, circular avatar 40px diameter, name "Admin Daboy" (14px), role "Cashier 01" (12px gray).
- **Left Sidebar Sections**:
  - "Sales Analytic 5": Top section, 200px height, with icon and badge (blue #2196F3).
  - Order Tabs: Scrollable list, each tab 200px width x 48px height, with order number (blue badge), item count, and status pill (green/orange).
    - Margins: 8px between tabs.
    - Padding: 12px internal.
- **Main Content Sections**:
  - "Menu Items (51)": Header with search icon (24px), right-aligned.
  - Categories: Horizontal tabs (All Menu selected blue), each 100px width x 32px height, border-radius: 20px, margin: 0 4px.
  - Menu Grid: 3-column CSS Grid (repeat(3, 1fr)), gap: 16px (1rem).
    - Each card: 300px width x 320px height (including image).
- **Right Sidebar Sections**:
  - "Order's Summary": Top header with close icon (24px).
  - Item List: Vertical stack, each item 280px width x 60px height, with image thumbnail (40px), name, price (x quantity), trash icon (red 20px).
    - Padding: 12px per item.
  - "Payment Summary": Bottom section, 280px width, with key-value pairs (right-aligned values), total in bold.
  - "Place Order" Button: Full-width, bottom-aligned.
- **Margins & Padding**:
  - Global: 24px (1.5rem) outer margins.
  - Sections: 16px (1rem) internal padding.
  - Footer: None visible; assume sticky if needed for mobile.

## Typography

- **Font Family**: Primary: 'Inter' or 'Roboto' (sans-serif fallback). Use Google Fonts for web implementation.
- **Sizes & Weights**:
  - Headings (e.g., "Admin POS", "Menu Items"): 20px (1.25rem), weight: 600 (semi-bold), line-height: 28px.
  - Subheadings (e.g., order numbers, category tabs): 16px (1rem), weight: 500 (medium), line-height: 24px.
  - Body Text (e.g., item names, prices): 14px (0.875rem), weight: 400 (regular), line-height: 20px.
  - Small Text (e.g., "Cashier 01", item counts): 12px (0.75rem), weight: 400, line-height: 16px.
  - Buttons: 14px (0.875rem), weight: 500, line-height: 20px.
- **Colors**:
  - Primary Text: #212529 (dark gray).
  - Secondary Text (e.g., prices, statuses): #6C757D (medium gray).
  - Accents: Blue #007BFF for selected, Green #198754 for ready, Orange #FD7E14 for in-progress, Red #DC3545 for errors/trash.
- **Usage**:
  - Uppercase for tabs/categories if matching screenshot (e.g., "Dine In").
  - Left-aligned by default; right-aligned for prices/summaries.

## Colors & Theme

- **Primary Palette**:
  - Background (global): #FFFFFF (white).
  - Sidebar Background: #F8F9FA (light gray).
  - Accent Blue (buttons, selected tabs): #007BFF (RGB: 0,123,255).
  - Green (ready status): #198754 (RGB: 25,135,84).
  - Orange (in-progress status): #FD7E14 (RGB: 253,126,20).
  - Red (trash, errors): #DC3545 (RGB: 220,53,69).
  - Gray (borders, secondary text): #DEE2E6 (RGB: 222,226,230) for borders; #6C757D for text.
  - Purple (logo icon): #6F42C1 (RGB: 111,66,193).
- **Theme Notes**:
  - Light theme only; no dark mode implied.
  - Borders: 1px solid #DEE2E6 for cards/dividers.
  - Shadows: Subtle box-shadow: 0 4px 6px rgba(0,0,0,0.05) for cards/header.
  - Icons: #495057 (dark gray) default, colored for accents.

## Components

- **Buttons**:
  - Primary (e.g., "Place Order"): Full-width (280px), height 48px, background #007BFF, text white, border-radius: 24px, padding: 12px 24px.
    - States: Hover: background #0056B3 (darken 20%); Active: box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); Disabled: background #A5D8FF (light blue), opacity 0.6.
  - Secondary (e.g., "Choose", "Add Item"): 120px width, height 36px, background #007BFF or transparent with blue border, border-radius: 20px, padding: 8px 16px.
    - With Counter (e.g., - 1 +): Inline flex, buttons 24px square, border: 1px solid #DEE2E6.
  - Status Pills (e.g., "Ready to serve"): 160px width, height 32px, border-radius: 16px, padding: 8px, font 12px.
- **Cards (Menu Items)**:
  - Size: 300px width x 320px height.
  - Structure: Image top (280px width x 180px height, border-radius: 12px top), name (14px bold), price (14px gray), button bottom.
  - Padding: 12px internal.
  - Border: 1px solid #DEE2E6, border-radius: 12px.
  - States: Hover: box-shadow: 0 4px 8px rgba(0,0,0,0.1); Selected: green check icon overlay.
- **Inputs**:
  - Search (in menu header): 200px width, height 36px, border: 1px solid #CED4DA, border-radius: 20px, padding: 8px 12px, with magnifier icon (20px gray).
- **Tables/Lists**:
  - Order Summary List: No table; use flex rows. Each row: padding 12px, border-bottom: 1px solid #DEE2E6.
  - Payment Summary: Definition list style, 14px text, right-aligned values.
- **Icons**:
  - Size: 24px default (e.g., search, trash, close).
  - States: Hover: opacity 0.8.
  - Naming: Use consistent classes like .icon-trash, .icon-search.
- **Images**:
  - Dish Thumbnails: In cards, 280x180px; in summary, 40x40px square.

## Interactions & Animations

- **Hover Effects**: Buttons lighten background by 10% (transition: background 0.2s ease). Cards scale 1.02 (transform: scale(1.02); transition: 0.3s ease).
- **Clickable Areas**: Entire menu cards clickable to select/add. Trash icons trigger delete confirmation modal.
- **Transitions**: All hovers/transitions: 0.2s ease-in-out for color/opacity; 0.3s for scale/shadow.
- **Modals/Dropdowns**: Not visible, but assume order cancel triggers modal (centered, 400px width, white background, overlay #00000080). User profile dropdown on click (200px width, list items).
- **Dynamic Behavior**: Adding item updates summary in real-time (no page reload). Status changes (e.g., In Progress to Ready) with fade-in animation (opacity 0 to 1, 0.5s). Quantity counters: Click +/− updates total instantly.
- **Accessibility**: Ensure tab-focus (outline: 2px dotted #007BFF), ARIA labels for icons (e.g., aria-label="Remove item").

## Images & Icons

- **Dish Images**: 280x180px in cards (aspect ratio 16:9), JPG/PNG recommended for quality/compression. Placeholder: Use Unsplash-style food photos. In summary: 40x40px cropped thumbnails.
- **Icons**:
  - Logo: 32x32px SVG, purple fill.
  - Trash: 20x20px SVG, red #DC3545.
  - Search: 24x24px SVG, gray #6C757D.
  - Check (selected): 20x20px green #198754.
  - Recommendations: Use Icon libraries like Font Awesome or Material Icons. Export as SVG for scalability; fallback PNG.
- **Placement**: Images top-aligned in cards; icons right-aligned in lists (e.g., trash 8px from edge).

## Responsive Design Notes

- **Breakpoints**: Desktop (>1024px): As described. Tablet (768-1024px): Stack sidebars vertically; menu grid to 2 columns. Mobile (<768px): Full stack (header, main, summary); menu grid to 1 column.
- **Adaptations**:
  - Header: Tabs become horizontal scroll or dropdown on mobile.
  - Sidebars: Left sidebar collapses to hamburger menu; right summary becomes bottom sticky bar (100% width, 80px height).
  - Grid: Use media queries for grid-template-columns: auto on mobile.
  - Touch Optimizations: Increase button sizes +20% (e.g., 48px min height), add 8px extra padding.
  - Images: Scale to 100% width, maintain aspect ratio (object-fit: cover).
  - Testing: Ensure no overflow; use vw/vh for fluid layouts where px isn't fixed.
