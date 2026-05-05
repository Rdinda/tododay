---
name: Elevated Focus
colors:
  surface: '#13131b'
  surface-dim: '#13131b'
  surface-bright: '#393841'
  surface-container-lowest: '#0d0d15'
  surface-container-low: '#1b1b23'
  surface-container: '#1f1f27'
  surface-container-high: '#292932'
  surface-container-highest: '#34343d'
  on-surface: '#e4e1ed'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e4e1ed'
  inverse-on-surface: '#303038'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#13131b'
  on-background: '#e4e1ed'
  surface-variant: '#34343d'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  gutter: 1.5rem
  margin: 2rem
---

## Brand & Style

This design system is built on a foundation of "Elevated Focus," targeting high-performance professionals who require a frictionless, premium environment for task management. The aesthetic leverages a **Corporate/Modern** style infused with **Minimalism** to eliminate cognitive load and emphasize content over chrome.

The UI evokes a sense of quiet authority and precision. By utilizing a deep, near-black palette paired with vibrant functional accents, the design system creates a high-contrast environment where priorities are immediately visible. The atmosphere is sophisticated and utilitarian, ensuring that the tool feels like a professional instrument rather than a casual utility.

## Colors

The color palette is strictly optimized for deep dark-mode environments. The primary engine of the interface is the interplay between the `#0A0A0A` background and its tiered surfaces. 

- **Primary Indigo:** Used sparingly for actionable elements, progress indicators, and active states.
- **Surface Hierarchy:** `Surface` is the primary container color, while `Surface-2` is reserved for elevated cards, popovers, and secondary navigation elements.
- **Functional Colors:** Success and Danger tokens are saturated to maintain high legibility against the dark background, ensuring system alerts are unmistakable.
- **Neutrality:** The use of `Muted` and `Border` tokens ensures that structural elements remain subservient to user-generated content.

## Typography

This design system utilizes **Inter** exclusively to maintain a systematic and utilitarian feel. The typographic scale is designed for maximum legibility in high-density data views.

- **Headlines:** Use tighter letter-spacing and heavier weights to anchor pages.
- **Body Text:** Standardized at 16px for optimal readability with a generous 1.6 line height to prevent visual fatigue.
- **Labels:** Small, uppercase, and tracked out to provide clear categorization without occupying significant vertical space.
- **Contrast:** Always use the `Text` token for primary information and `Muted` for secondary meta-data or descriptions.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with strict adherence to an 8px rhythmic system. This ensures consistency across the diverse task views and dashboard modules.

- **Grid:** A 12-column layout for desktop views, transitioning to a single column for mobile. Gutters are fixed at `1.5rem` to provide breathing room between functional modules.
- **Padding:** Internal card padding is standardized at `1.5rem` (`lg`) to maintain a premium feel.
- **Density:** For list-heavy task views, vertical spacing between rows should be reduced to `0.5rem` (`sm`) to allow more information to be visible above the fold.

## Elevation & Depth

In this design system, depth is primarily communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows.

- **Layer 0:** Background (`#0A0A0A`) for the main canvas.
- **Layer 1:** Surface (`#141414`) for primary layout containers like sidebars and main content cards.
- **Layer 2:** Surface-2 (`#1E1E1E`) for interactive elements like input fields, dropdown menus, and hovered states.
- **Borders:** All interactive components must use a `1px` border using the `Border` token (`#27272A`). This sub-pixel definition provides a crisp, premium edge that separates surfaces without the need for heavy shadows.
- **Shadows:** When necessary for modals or popovers, use a subtle, highly diffused black shadow with 40% opacity to lift the element off the page.

## Shapes

The design system employs a **Rounded** shape language to soften the industrial feel of the dark theme and provide a modern, approachable touch.

- **Standard Radius:** All primary containers and large components (cards, modals) use `rounded-xl` (1.5rem).
- **Secondary Radius:** Smaller interactive elements like buttons and input fields use `rounded-lg` (1rem).
- **Consistency:** Avoid sharp corners entirely. Even selection indicators or focus rings should follow the underlying component's radius to maintain the premium visual flow.

## Components

Components in this design system are designed to be high-performance and visually quiet.

- **Buttons:** Primary buttons use a solid `Indigo` background with white text. Secondary buttons use `Surface-2` with a `Border` stroke. Hover states should feature a subtle brightness increase (duration-300).
- **Input Fields:** Styled with `Surface-2` background and a `Border` stroke. On focus, the border transitions to `Primary` indigo.
- **Task Cards:** Utilize `Surface` for the container. Use `Success` for completed checkboxes and `Muted` for the strikethrough text state.
- **Chips/Badges:** Use a subtle `Surface-2` background with `Muted` text for categories; use a tinted version of `Primary` or `Success` for status indicators.
- **Lists:** Rows should have a subtle bottom border or use alternating `Surface` and `Background` fills for clear separation.
- **Progress Bars:** Use a thick `2px` track in `Surface-2` with a `Primary` indigo fill for active progress.