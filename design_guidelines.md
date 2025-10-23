# Ice Cream Factory Dashboard - Design Guidelines

## Design Approach

**Selected System:** Hybrid approach combining Linear's clean task management aesthetics + GitHub's data visualization patterns + Carbon Design System for industrial dashboard components

**Justification:** This is a utility-focused, data-heavy dashboard requiring real-time monitoring capabilities across two distinct user modes. The design prioritizes efficiency, learnability, and clear status communication over visual appeal.

**Key Design Principles:**
- Clarity over decoration: Every visual element serves a functional purpose
- Immediate status recognition: Traffic light system must be instantly readable
- Dual-context optimization: Manager (desktop) vs Operator (mobile) require distinct layouts
- Industrial professionalism: Clean, professional aesthetics suitable for factory environment

## Core Design Elements

### A. Color Palette

**Traffic Light System (Critical):**
- Green (Success): 142 71% 45% - Operations normal, tasks completed
- Yellow (Warning): 45 93% 47% - Attention needed, approaching threshold
- Red (Error): 0 84% 60% - Critical alert, immediate action required

**Primary Brand Colors:**
- Primary: 215 25% 27% - Deep slate blue for headers, primary actions
- Secondary: 210 16% 93% - Light gray for backgrounds, cards
- Accent: 190 85% 45% - Cyan for interactive elements, highlights

**Backgrounds:**
- Dark mode base: 220 13% 13%
- Dark mode surface: 217 19% 18%
- Dark mode elevated: 217 19% 22%

**Text:**
- Primary text: 210 11% 96%
- Secondary text: 215 14% 71%
- Disabled: 217 10% 50%

### B. Typography

**Font Family:** Inter (via Google Fonts CDN)
- Excellent readability at all sizes
- Professional, modern, industrial-appropriate
- Strong number rendering for data visualization

**Hierarchy:**
- Display (Manager Dashboard Title): text-4xl font-bold (36px)
- H1 (Section Headers): text-2xl font-semibold (24px)
- H2 (Station Names, Card Headers): text-lg font-medium (18px)
- Body (Primary Content): text-base (16px)
- Small (Metadata, Labels): text-sm (14px)
- Tiny (Grid Cell Data): text-xs (12px)

**Special Typography:**
- Monospace numbers for batch IDs: font-mono
- Bold traffic light status labels: font-semibold
- Alert text: font-medium for emphasis

### C. Layout System

**Tailwind Spacing Primitives:** Use units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: gap-8, space-y-8
- Card margins: m-4
- Icon spacing: mr-2, ml-3
- Grid gaps: gap-4, gap-6

**Manager Mode Layout (Desktop):**
- Sidebar navigation: w-64 (256px) fixed left
- Main content: flex-1 with max-w-7xl container
- Factory floor plan: Full-width canvas with grid overlay
- Dashboard grid: 12-column responsive grid
- Card-based components: min-w-80, max-w-md

**Operator Mode Layout (Mobile):**
- Full-width single column: w-full
- Bottom navigation bar: fixed bottom with h-16
- Scan button: Large circular FAB (w-20 h-20) center-bottom
- Alert cards: Full-width stack with dismissible swipe
- Task checklist: Compact list view with large touch targets (min-h-14)

### D. Component Library

**Manager Components:**

1. **Factory Floor Plan Builder**
   - Canvas: bg-dark-surface with subtle grid pattern (border-dark-elevated)
   - Draggable stations: Rounded rectangles (rounded-lg) with icons + labels
   - Station colors: Color-coded by type (tanks: blue, rooms: purple, docks: green)
   - Drop zones: Dashed border on hover (border-2 border-dashed)
   - Controls: Zoom slider, reset button, save configuration

2. **Production Dashboard - GitHub-style Grid**
   - Grid cells: 12px × 12px squares (w-3 h-3)
   - Cell colors: Traffic light system (green/yellow/red/gray for no-data)
   - Hover tooltip: Batch details on mouseover
   - Time axis: Horizontal labels below grid
   - Responsive: Scrollable horizontally on smaller screens

3. **Search/Filter Bar**
   - Sticky top position: sticky top-0 z-10
   - Search input: Prominent with icon, rounded-lg, h-12
   - Filter chips: Removable tags with × button
   - Clear all button: text-accent hover effect

4. **Alert Configuration Panel**
   - Threshold slider: Custom range input with visual indicator
   - Toggle switches: For alert types
   - Notification preview: Shows sample alert

**Operator Components:**

1. **QR Scanner Interface**
   - Full-screen camera view: Fixed overlay
   - Viewfinder: Centered square with animated corners
   - Scan success: Green flash animation with haptic feedback
   - Manual entry fallback: Bottom sheet with number pad

2. **Alert Notification Cards**
   - Priority badges: Colored dot indicator (red/yellow)
   - Timestamp: Relative time (e.g., "2h ago")
   - Dismiss action: Swipe-to-dismiss gesture
   - Alert icons: Heroicons for alert types

3. **Traffic Light Status Display**
   - Large circular indicators: w-16 h-16
   - Pulse animation on red status
   - Stacked vertical layout with labels
   - Previous station summary: Compact list

4. **Task Input Form**
   - Large touch targets: min-h-12 for all inputs
   - Radio buttons: Custom styled with traffic light colors
   - Text inputs: Rounded borders, clear validation states
   - Submit button: Full-width primary button at bottom

**Shared Components:**

- Navigation: Top bar (manager) vs bottom bar (operator)
- Buttons: Primary (bg-primary), Secondary (outline), Danger (bg-red)
- Cards: Elevated shadow (shadow-md), rounded corners (rounded-lg)
- Badges: Small rounded pills for counts and statuses
- Loading states: Skeleton screens for data fetching
- Empty states: Centered icon + message

### E. Icons

**Icon Library:** Heroicons (via CDN)
- Consistent 24px size for main icons
- 16px for inline/secondary icons
- Outline style for inactive states
- Solid style for active/selected states

**Key Icons:**
- Factory stations: cube, beaker, fire, snowflake, archive
- Actions: qr-code, magnifying-glass, bell, plus-circle
- Status: check-circle, exclamation-triangle, x-circle
- Navigation: home, chart-bar, cog, user-circle

### F. Data Visualization

**Grid Visualization:**
- Cell spacing: gap-1 between cells
- Max grid width: Scrollable container
- Legend: Color-coded key positioned top-right
- Interaction: Click cell for batch details modal

**Status Indicators:**
- Dot indicators: 8px circles for compact lists
- Progress bars: Linear for completion percentages
- Gauges: Semi-circular for thresholds

### G. Animations

Use sparingly and only for functional feedback:
- QR scan success: 200ms green flash
- Alert appearance: 300ms slide-in from top
- Traffic light pulse: Continuous on critical red status
- Drag-and-drop: Subtle scale on pickup, shadow on drag
- Button interactions: Default hover states only, no custom animations

### H. Images

**No hero images required** - This is a functional dashboard, not a marketing page.

**Icons/Illustrations:**
- Station icons: Simple line-art representations of factory equipment
- Empty state illustrations: Minimal, single-color illustrations for "no data" states
- QR scanner overlay: Camera viewfinder graphic

All visual assets should be functional SVG icons from Heroicons rather than decorative imagery.