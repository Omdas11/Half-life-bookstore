---
name: Lambda Archive
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#584237'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#006398'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a2f4'
  on-tertiary-container: '#003554'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Literata
    fontSize: 20px
    fontWeight: '500'
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
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

This design system is built for a sophisticated, editorial-first digital archive. It balances the intellectual weight of a research library with the crisp efficiency of a modern SaaS platform. The brand personality is authoritative yet accessible, favoring clarity and high-contrast visuals over decorative flourishes.

The design style is a hybrid of **Minimalism** and **Modern Editorial**. It utilizes heavy whitespace to provide breathing room for dense information, while employing sharp typography and a singular, vibrant accent to guide the user's eye. The emotional response should be one of "structured discovery"—organized, academic, and premium.

## Colors

The palette is anchored by a high-contrast foundation. In the default light mode, the background is pure white (#ffffff), paired with black text to ensure maximum legibility and an editorial feel. The primary accent is a vibrant orange (#f97316), used sparingly for calls to action, active states, and critical highlights.

For the dark theme toggle, the system flips to a deep charcoal/black (#09090b) with off-white text. Secondary elements use a neutral scale to define borders and metadata, maintaining a monochromatic base that allows the orange accent to remain the sole focus of interaction.

## Typography

The typographic system relies on a sophisticated hierarchy. **Literata** (serving as the closest high-quality alternative to Tiempos Text) provides the editorial soul of the design, used for headlines and titles to evoke a sense of tradition and authority. 

To maintain a modern, technical edge, **Inter** is used for body copy to ensure readability in dense data sets. **JetBrains Mono** is introduced for metadata and labels, reinforcing the "archive" and "technical" nature of the product. Large displays should use tighter letter spacing, while small labels should be slightly tracked out for clarity.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to maintain the "columnar" feel of a physical publication. The layout is centered on a 12-column grid with a maximum width of 1280px. 

On mobile, the layout transitions to a fluid single-column stack with 16px side margins. Spacing follows a strict 4px base unit, ensuring all elements align to a consistent vertical rhythm. Use `xl` (48px) spacing between major sections to preserve the minimalist aesthetic and emphasize content hierarchy.

## Elevation & Depth

To align with the minimalist and high-contrast goals, this system avoids heavy shadows. Depth is primarily communicated through **Low-contrast outlines** and **Tonal layering**.

Elements like cards and menus use a subtle 1px border (#e4e4e7 in light mode). When an element requires "lift," use a very light, neutral background tint (e.g., a "paper" gray) rather than a drop shadow. This keeps the interface feeling flat, modern, and intentional. Interactive elements may utilize a crisp, 2px solid black border upon hover or focus to reinforce the high-contrast aesthetic.

## Shapes

The shape language is "Soft" (0.25rem), providing a subtle hint of modern approachability without compromising the professional, serious nature of an archive. Components like input fields and primary buttons use the base `rounded` (4px) setting. Larger containers, such as featured cards, may use `rounded-lg` (8px), but never exceed this to maintain the structured, architectural feel of the grid.

## Components

### Buttons
Primary buttons are solid black (or primary orange for critical actions) with white text, utilizing the `button` typography style. Secondary buttons are outlined with a 1px border.

### Input Fields
Inputs use a minimal bottom-border only or a very light 4px rounded frame. Labels always use the **JetBrains Mono** label-sm style, positioned strictly above the field.

### Cards
Cards are defined by their content hierarchy rather than heavy containers. Use a 1px neutral border and significant internal padding (24px). For the "Lambda Archive" look, cards often feature a small orange accent bar on the left side to denote "active" or "new" records.

### Navigation
The top navigation should be clean and persistent, using the `label-sm` font for links. The active state is indicated by a 2px orange underline rather than a background change.

### Data Lists
Lists should be high-density but legible. Use 1px horizontal dividers between items and utilize the monospaced font for ID numbers or date-stamps to emphasize the archival nature of the data.