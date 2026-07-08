---
name: Civic Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424750'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727781'
  outline-variant: '#c2c7d1'
  surface-tint: '#27609c'
  primary: '#003866'
  on-primary: '#ffffff'
  primary-container: '#0b4f8a'
  on-primary-container: '#94c2ff'
  inverse-primary: '#a2c9ff'
  secondary: '#005fae'
  on-secondary: '#ffffff'
  secondary-container: '#6babff'
  on-secondary-container: '#003e75'
  tertiary: '#592a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#7b3c00'
  on-tertiary-container: '#ffab6f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004881'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a5c8ff'
  on-secondary-fixed: '#001c3a'
  on-secondary-fixed-variant: '#004785'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb785'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  text-charcoal: '#1E293B'
  text-slate-muted: '#64748B'
  surface-card: '#FFFFFF'
  border-subtle: '#E2E8F0'
  success: '#059669'
  pending: '#D97706'
  conflict: '#DC2626'
  in-progress: '#2563EB'
  dark-bg-deep: '#0F172A'
  dark-surface-card: '#1E293B'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  grid-columns: '12'
  gutter: 24px
  margin-desktop: 48px
  margin-tablet: 32px
  margin-mobile: 16px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 24px
  unit-xl: 48px
---

## Brand & Style

This design system is engineered for high-stakes coordination and civil infrastructure management. It balances the authoritative weight of government institutions with the streamlined efficiency of modern enterprise SaaS. The aesthetic is rooted in **Corporate Modernism**, prioritizing clarity, data density, and reliability above all else.

The target audience consists of department heads, city planners, and municipal operators who require a "heads-up display" for urban operations. The UI evokes a sense of calm under pressure, utilizing expansive whitespace, a systematic grid, and a restricted, purposeful color palette to reduce cognitive load. 

Visual signals are disciplined: no decorative flourishes, no emojis, and no heavy gradients. Instead, the system relies on precise typography, subtle depth via layering, and strict alignment to communicate stability and professional excellence.

## Colors

The palette is anchored by **Civic Blue**, a shade synonymous with institutional trust and digital governance. 

### Palette Strategy
- **Primary Surface:** Use `#F8FAFC` for the main application background to provide a cool, professional canvas that reduces eye strain compared to pure white.
- **Elevation:** Use pure `#FFFFFF` for cards and data containers to create a clear "layering" effect.
- **Typography:** Avoid pure black (`#000000`). Use `text-charcoal` for headings and primary body text to maintain a softer, more sophisticated high-contrast look.
- **Dark Mode:** When transitioning to dark mode, the background shifts to a deep navy (`#0F172A`), with cards utilizing `#1E293B`. Borders should remain subtle, using low-opacity white or deep slate variants.
- **Semantic Accents:** Colors like Green, Amber, and Red are reserved strictly for status communication and system alerts. They should never be used for decorative purposes.

## Typography

The typography uses **Inter**, a typeface specifically designed for user interfaces. Its high x-height and geometric clarity ensure legibility in data-heavy tables and complex dashboard environments.

- **Headings:** Use Semi-Bold (`600`) or Bold (`700`) for clear hierarchy. Tighter letter-spacing is applied to larger sizes to maintain a "confident" and compact professional look.
- **Body Text:** A generous line-height (1.5x) is maintained for long-form reporting and data entry to ensure comfort during extended use.
- **Labels:** Small labels and tags utilize a heavier weight and occasionally uppercase styling to differentiate them from body copy at a glance.
- **Mobile Scaling:** Headline sizes scale down by approximately 15-20% on mobile devices to prevent awkward text wrapping in narrow viewports.

## Layout & Spacing

This design system employs a **12-column fluid grid** for maximum flexibility in enterprise layouts. 

### Layout Philosophy
- **Rhythm:** An 8px linear scaling system is used for all internal padding and margins (`8px`, `16px`, `24px`, etc.).
- **Desktop:** Content is typically housed in a centered container with a maximum width of 1440px, or a full-width dashboard layout with a fixed left navigation sidebar (280px).
- **Responsiveness:**
  - **Desktop (1024px+):** 12 columns, 24px gutters.
  - **Tablet (768px - 1023px):** 8 columns, 16px gutters.
  - **Mobile (<767px):** 4 columns, 16px gutters.
- **Density:** In data-intensive views (e.g., Departmental Coordination Tables), spacing may be reduced to a 4px-base "compact mode" to allow more information to be visible without scrolling.

## Elevation & Depth

Depth is used sparingly to define hierarchy without cluttering the interface. The system relies on a **Tonal Layering** approach combined with **Ambient Shadows**.

- **Level 0 (Background):** `#F8FAFC`. Used for the lowest page level.
- **Level 1 (Cards/Surfaces):** `#FFFFFF`. These elements use a very soft, diffused shadow (`0px 4px 12px rgba(0, 0, 0, 0.05)`) and a subtle 1px border (`#E2E8F0`) to define their boundaries.
- **Level 2 (Popovers/Dropdowns):** Increased shadow depth (`0px 10px 24px rgba(0, 0, 0, 0.1)`) to indicate temporary overlays that require immediate attention.
- **Level 3 (Modals):** High-contrast overlay (Scrim) at 40% opacity of the charcoal text color, with the modal surface sitting on top.

Avoid heavy drop shadows or neomorphic extrusions. The goal is "flat-plus"—a flat design that uses just enough shadow to indicate clickability and stacking.

## Shapes

The shape language reflects "Soft Precision." While government systems were traditionally sharp and rigid, this system uses modern rounding to feel accessible yet professional.

- **Standard Elements:** Buttons, inputs, and small containers use a **0.5rem (8px)** radius.
- **Large Containers:** Cards and major layout sections use a **1rem (16px)** radius to create a distinct, modern silhouette.
- **Interactive States:** Focus states should use a 2px offset solid stroke in Primary Blue to ensure high visibility for accessibility (WCAG 2.1 compliance).

## Components

### Buttons
- **Primary:** Solid `#0B4F8A` with white text. High-contrast, rectangular with 8px rounding.
- **Secondary:** Transparent background with a 1px `#0B4F8A` border and text.
- **Ghost:** No border or background; text only. Used for tertiary actions in toolbars.

### Input Fields
- White background with a 1px `#E2E8F0` border.
- On focus: Border changes to `#0B4F8A` with a subtle 3px outer glow in 10% opacity blue.
- Labels sit above the field in `label-md` style.

### Chips & Tags
- **Status Tags:** Use light-tinted backgrounds of the semantic colors (e.g., 10% opacity) with dark-toned text for readability.
- **Departmental Markers:** Small, 4px square markers of specific colors next to text to denote department ownership without overwhelming the UI.

### Cards
- White background, 16px rounded corners, 1px subtle border.
- Internal padding should be a consistent 24px (unit-lg).

### Icons
- Use **Simple Line Icons** (e.g., 2px stroke weight). Avoid filled icons unless used for active navigation states. Icons should always be the same color as the text they accompany.