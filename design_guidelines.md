# Miko Factory Dashboard - Design Guidelines

## Brand Identity
This application follows **Unilever's brand design system** with a professional, clean, and modern aesthetic inspired by their corporate website.

## Design Approach

**Core Principles:**
- Clean, professional aesthetics suitable for industrial/corporate environment
- Unilever brand colors (deep navy blue) as primary
- Clarity over decoration: Every visual element serves a functional purpose
- Immediate status recognition: Traffic light system must be instantly readable
- Dual-context optimization: Manager (desktop) vs Operator (mobile) require distinct layouts

## Color Palette

### Unilever Brand Colors
- **Primary (Unilever Blue)**: `hsl(212, 69%, 19%)` - Deep navy blue for headers, primary actions, branding
- **Bright Blue Accent**: `hsl(212, 69%, 45%)` - Used for interactive elements, focus states, and highlights
- **Pure White**: `hsl(0, 0%, 100%)` - Clean background for professional appearance

### Functional Colors (Factory Status - Traffic Light System)
- **Success Green**: `hsl(142, 71%, 45%)` - Operations normal, tasks completed, "all good" status
- **Warning Yellow**: `hsl(45, 93%, 47%)` - Attention needed, minor issues, approaching threshold
- **Alert Red**: `hsl(0, 84%, 60%)` - Critical alert, immediate action required

### Neutral Colors
- **Text Primary**: `hsl(212, 35%, 25%)` - Deep blue-gray for main text
- **Text Secondary**: `hsl(212, 20%, 50%)` - Muted blue-gray for supporting text
- **Borders**: `hsl(210, 15%, 90%)` - Light gray for subtle separation
- **Card Background**: `hsl(210, 20%, 98%)` - Very light background for content cards
- **Muted Background**: `hsl(210, 20%, 94%)` - For secondary surfaces

## Typography

### Font Family
- **Primary**: Inter, Helvetica Neue, Arial, sans-serif
- Clean, professional sans-serif matching Unilever's corporate style
- Excellent readability at all sizes
- Strong number rendering for data visualization

### Font Weights
- **Semibold (600)**: Headings and important labels
- **Medium (500)**: Subheadings and emphasized text
- **Normal (400)**: Body text

### Font Sizes & Hierarchy
- **h1 (Display)**: `text-3xl` (1.875rem / 30px) - Page titles
- **h2 (Section)**: `text-2xl` (1.5rem / 24px) - Section headers
- **h3 (Subsection)**: `text-xl` (1.25rem / 20px) - Card titles, station names
- **Body**: `text-base` (1rem / 16px) - Standard text
- **Small**: `text-sm` (0.875rem / 14px) - Supporting information, metadata
- **Extra Small**: `text-xs` (0.75rem / 12px) - Labels, tiny details

### Letter Spacing
- **Headings**: `-0.015em` (tighter for better readability at larger sizes)
- **Body**: `0em` (default)

### Special Typography
- **Monospace**: Use `font-mono` for batch IDs and codes
- **Bold status labels**: Use `font-semibold` for traffic light status
- **Alert text**: Use `font-medium` for emphasis

## Layout Principles

### Spacing System
Use Tailwind's spacing scale consistently:
- **Tight**: `p-2`, `gap-2` (0.5rem / 8px) - Within small components
- **Small**: `p-4`, `gap-4` (1rem / 16px) - Component spacing
- **Medium**: `p-6`, `gap-6` (1.5rem / 24px) - Section spacing
- **Large**: `p-8`, `gap-8` (2rem / 32px) - Major content blocks

### Border Radius
- **Standard**: `rounded-md` (0.375rem / 6px) - Professional, slightly rounded corners
- Avoid overly rounded corners to maintain corporate aesthetic
- Use `rounded-full` only for circular indicators (traffic lights, status dots)

### Shadows
- Use subtle shadows for depth
- Avoid heavy drop shadows
- Prefer clean borders over shadows when possible
- Cards should have minimal elevation

## Component Styling

### Cards
- Background: White or very light gray (`hsl(210, 20%, 98%)`)
- Border: Subtle light gray (`hsl(210, 15%, 90%)`)
- Padding: Consistent `p-4` to `p-6`
- Border radius: `rounded-md`
- Minimal shadow for slight elevation

### Buttons
- **Primary**: Unilever blue background with white text
- **Secondary**: Light gray background with blue text  
- **Outline**: Transparent background with blue border
- **Ghost**: Transparent with hover state
- Consistent height: `h-9` for default size
- Use `size` prop: `sm`, `default`, `lg`, `icon`

### Badges
- Small rounded pills for status indicators
- Color-coded for factory traffic light system:
  - Green variant for success status
  - Yellow (secondary) variant for warning status
  - Red (destructive) variant for alert status
- Use sparingly for counts and important status

### Input Fields
- Light gray borders
- Blue focus ring (Unilever blue)
- Consistent padding and height
- Clear placeholder text in muted color
- Match button heights when on same line

## Manager Dashboard (Desktop)

### Layout
- **Sidebar Navigation**: Blue-gray sidebar (`hsl(212, 20%, 96%)`) with dark text
- **Main Content**: Pure white background with light gray cards
- **Header**: Sticky header with notifications and actions
- **Max Width**: `max-w-7xl` for main content container

### Production Timeline
- Horizontal scrolling for station progression
- Small squares (8px × 8px, each = 100 products) colored by status
- Blue accent for cursor/focus position
- Clean grid layout with station headers
- Sticky headers for easy reference

### Station Focus Panel
- Appears above timeline when station is selected
- Blue "Focus" badge with accent color
- Station-specific metrics with icons
- AI-generated insights in accent-colored panel
- Uses existing ProductionFlowVisualization for filtered batches

### Production Flow Visualization
- Shows all factory stations in sequence
- Real-time batch progression
- Color-coded squares (green/yellow/red)
- Station statistics and product counts
- Time tracking per station

### Floor Plan Builder
- Drag-and-drop station positioning
- Blue arrows showing production flow connections
- Clickable colored station icons
- Grid background for alignment
- "Link Stations" mode for creating connections
- SVG-based visual flow

### Dashboard Cards
- Draggable/reorderable with up/down arrows
- Statistics cards showing status counts
- Recent alerts section
- Recent batches list with traffic light indicators

## Operator Dashboard (Mobile)

### Layout
- **Mobile-First**: Max-width container (`max-w-md` / 28rem / 448px)
- **Swipeable Pages**: 4 distinct pages with tab navigation
- **Compact Header**: Operator name, role, notification badge
- **Previous Station Status**: Compact bar at top showing upstream stations

### Page Structure (Swipeable)
1. **Alerts Page**: Priority-based alert cards (red/yellow)
2. **Tasks Page**: Checkboxes with task details and previous status
3. **Self-Diagnosis Page**: Large radio buttons with traffic light colors
4. **Scan Page**: Camera activation with GDPR-compliant messaging

### Previous Station Status Bar
- Located in header below name/role
- Small colored dots (8px circles) with station names
- Shows 3-5 upstream stations
- Compact, single-line layout
- Muted background (`bg-muted/30`)

### Navigation
- Top tab bar with 4 pages
- Icons + text labels
- Blue accent for active page
- Arrow buttons for prev/next
- Clear page indicators

### Camera Activation (GDPR Compliant)
- **Gray placeholder square** (128px × 128px) with camera icon
- Manual activation required - no auto-start
- Clear messaging about privacy and permissions
- "Activate Camera" button prominent
- Manual code entry always available as fallback
- Error handling for denied permissions

### Mobile Interactions
- Large touch targets (minimum 44px × 44px)
- Clear hover states with `.hover-elevate`
- Active states with `.active-elevate-2`
- Swipe-friendly cards
- Bottom spacing to avoid gesture conflicts

## Interaction Design

### Hover States
- Subtle background elevation using `var(--elevate-1)`
- Smooth transition (150ms cubic-bezier)
- Use `.hover-elevate` utility class
- Applies to cards, buttons, list items

### Active/Press States
- More pronounced elevation using `var(--elevate-2)`
- Quick transition (100ms cubic-bezier)
- Use `.active-elevate-2` utility class
- Provides tactile feedback

### Focus States
- Blue ring using Unilever accent color (`hsl(212, 69%, 45%)`)
- Clear keyboard navigation support
- Accessible focus indicators (2px ring)
- Never remove focus outlines

### Loading States
- Skeleton screens for data fetching
- Spinner for button actions
- Progress indicators where appropriate
- Maintain layout to prevent shifts

## Data Visualization

### Traffic Light System (Critical)
- **Green**: Everything running smoothly, all clear
- **Yellow**: Minor issues, attention needed soon
- **Red**: Critical issues, immediate action required
- Use consistently across all status indicators

### Production Timeline
- Horizontal layout like video editing timeline
- Squares represent 100 products each
- Left-to-right progression through stations
- Blue flag cursor for focus position
- Saved cursor position (localStorage)
- Horizontal scrolling for navigation

### Station Metrics
- Icon + Label + Value format
- Trend indicators (up/down/stable arrows)
- Color-coded trends (green up, red down, gray stable)
- AI insights in italic text
- Clean number formatting with units

### Grid Visualization
- GitHub-style contribution grid
- Each cell represents batch status
- Hover tooltips for details
- Color intensity shows severity
- Scrollable containers for overflow

## Accessibility

### Color Contrast
- Ensure 4.5:1 contrast ratio for normal text
- 3:1 ratio for large text (18px+) and UI components
- Test traffic light colors for color-blind users
- Never rely on color alone for information

### Interactive Elements
- Minimum touch target: 44px × 44px (mobile)
- 40px × 40px minimum for desktop
- Clear focus indicators for keyboard navigation
- ARIA labels for screen readers
- Semantic HTML elements

### Forms
- Clear labels for all inputs
- Error messages associated with fields
- Radio buttons large enough for easy selection
- Visual feedback for all interactions

## Best Practices

1. **Brand Consistency**: Use Unilever blue (`hsl(212, 69%, 19%)`) for all primary actions and branding
2. **Professional Aesthetic**: Maintain clean, corporate appearance throughout
3. **Clarity First**: Prioritize readability and functionality over decoration
4. **Mobile-First**: Design operator mode for mobile, enhance for desktop
5. **White Space**: Use generous spacing for uncluttered layouts
6. **Typography Hierarchy**: Clear distinction between heading levels
7. **Status Colors**: Traffic light system only for status, blue for brand/actions
8. **Consistency**: Same components styled identically across modes
9. **Performance**: Optimize for real-time updates and smooth interactions
10. **Privacy**: GDPR-compliant camera access with clear user consent

## Animation Guidelines

Use sparingly and only for functional feedback:
- Page transitions: Smooth but fast (200-300ms)
- Alert appearance: Slide-in from top/side
- Status changes: Subtle fade or color transition
- Traffic light pulse: Only on critical red status
- Drag-and-drop: Scale and shadow feedback
- Button interactions: Default hover/active states

Avoid:
- Gratuitous animations
- Long transition times
- Animations that delay user actions
- Auto-playing animations

## Mock Data Notes

All mock data functionality is clearly marked with `//todo: remove mock functionality` comments for easy identification and removal when connecting to real APIs.

Mock data includes:
- Production batches (15 initial, auto-generated)
- Operator tickets/alerts
- Station metrics and AI insights
- Factory floor configurations
