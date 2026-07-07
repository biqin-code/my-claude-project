---
name: Soft Bloom Narrative
colors:
  surface: '#fff7fe'
  surface-dim: '#e3d6e9'
  surface-bright: '#fff7fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf0ff'
  surface-container: '#f7e9fd'
  surface-container-high: '#f1e4f7'
  surface-container-highest: '#ebdef1'
  on-surface: '#201926'
  on-surface-variant: '#4f444a'
  inverse-surface: '#352d3c'
  inverse-on-surface: '#faecff'
  outline: '#81737a'
  outline-variant: '#d3c2ca'
  surface-tint: '#904568'
  primary: '#904568'
  on-primary: '#ffffff'
  primary-container: '#ffb1d0'
  on-primary-container: '#833a5c'
  inverse-primary: '#ffb0cf'
  secondary: '#665b63'
  on-secondary: '#ffffff'
  secondary-container: '#eedee8'
  on-secondary-container: '#6d6169'
  tertiary: '#6f5767'
  on-tertiary: '#ffffff'
  tertiary-container: '#ddbfd2'
  on-tertiary-container: '#634c5c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e5'
  primary-fixed-dim: '#ffb0cf'
  on-primary-fixed: '#3d0123'
  on-primary-fixed-variant: '#742e50'
  secondary-fixed: '#eedee8'
  secondary-fixed-dim: '#d1c2cc'
  on-secondary-fixed: '#211920'
  on-secondary-fixed-variant: '#4e444c'
  tertiary-fixed: '#f9daed'
  tertiary-fixed-dim: '#dcbed1'
  on-tertiary-fixed: '#281623'
  on-tertiary-fixed-variant: '#56404f'
  background: '#fff7fe'
  on-background: '#201926'
  surface-variant: '#ebdef1'
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
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
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
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  amount-display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style

The design system is built upon the pillars of **empathy, mindfulness, and clarity**. It targets individuals who seek a gentle, reflective relationship with their finances through a "low-friction" interface. The aesthetic moves away from traditional cold banking, embracing a **Sophisticated Modernism** softened with a dusty, floral-inspired palette and highly rounded, "pill-like" geometry.

The visual language employs heavy whitespace and a "soft-edge" philosophy to reduce cognitive load during the data entry process. By combining a professional structure with vibrant yet sophisticated tones, the system transforms the chore of bookkeeping into a serene experience of "soft growth" and financial reflection.

- **Primary Style:** Sophisticated Modern with muted organic influences and high-radius forms.
- **Visual Cues:** High legibility, subtle depth, and intentional use of airy, floral tones for data categorization.
- **Emotional Response:** Calm, thoughtful, stable, and nurturing.

## Colors

The palette is anchored by a vibrant **Petal Pink**, symbolizing a modern, energetic, and empathetic approach to wealth management. This primary color provides a clear visual focal point for call-to-action buttons, primary branding, and highlighted states. The neutral palette relies on **Muted Lavender and Soft Grays** to maintain a cool, professional, and trustworthy atmosphere that feels more contemporary and balanced than traditional warm tones.

Semantic colors are reserved for financial categories, ensuring that users can identify spending patterns at a glance. The introduction of a lighter **Lavender Mist** as a secondary accent provides a delicate highlight for UI elements and backgrounds, creating a layered floral effect that feels both organized and organic.

- **Primary:** Used for the main brand touchpoints and primary actions (Petal Pink).
- **Secondary:** Lavender Mist (#f7e7f1), used for soft highlights and subtle UI elements.
- **Neutral:** A range of cool-toned lavender-grays used for typography and structural boundaries.

## Typography

The system utilizes **Inter** exclusively to ensure maximum readability and a clean, systematic appearance across all platforms. The typographic scale is designed to create a clear hierarchy between high-level financial summaries and granular transaction details.

- **Amount Display:** Specifically for currency values. It uses a tighter letter-spacing and heavier weight to emphasize the financial data.
- **Hierarchy:** Headlines are bold and concise; body text uses a generous line-height to ensure the interface feels airy and un-cluttered.
- **Labels:** Uppercase or bolded labels are used for metadata like "Date" or "Category" to distinguish them from user-generated content.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. On desktop, content is contained within a 1200px central column. On mobile and tablet, the layout transitions to a fluid 4-column or 8-column grid with 16px to 20px side margins.

- **Rhythm:** An 8pt spacing system is used for component architecture, while a 4pt scale handles fine-tuned internal alignment.
- **Density:** The system prioritizes "Comfortable" density. White space is used as a structural tool to group related financial records without the need for heavy dividers.
- **Mobile Reflow:** Transaction lists expand to 100% width on mobile, while the numeric keypad in the entry form is pinned to the bottom of the viewport for ergonomic "thumb-zone" access.

## Elevation & Depth

The system uses **Tonal Layering** combined with **Soft Ambient Shadows** to communicate hierarchy. 

- **Surface 0 (Background):** A light lavender-tinted neutral base used for the main application canvas.
- **Surface 1 (Cards):** Pure white surfaces that sit slightly above the background. These use a very soft, diffused shadow to maintain the gentle aesthetic.
- **Surface 2 (Modals/Popovers):** Elements like the "Quick Entry" form use a higher elevation with a more pronounced shadow and a backdrop blur of 8px to maintain focus on the task.
- **Interactive States:** Buttons use a subtle tonal shift or inner-glow on hover rather than heavy drop shadows to maintain a modern, sophisticated feel.

## Shapes

The shape language is defined by **High-Radius Pill** forms. This level of roundedness (1rem base) strikes a balance between professional precision and an extremely consumer-friendly, approachable warmth.

- **Base Components:** Input fields and buttons use the 1rem (`rounded-md`) radius, resulting in a distinctively soft, pill-like appearance.
- **Containers:** Dashboard cards and modal containers use 2rem (`rounded-lg`) to create a softer, more inviting appearance for data-heavy sections.
- **Indicators:** Category tags and chips utilize a full "pill" radius (999px) to clearly distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Petal Pink background with high-contrast text. 1rem corner radius for main actions.
- **Secondary/Ghost:** Muted Lavender or Lavender Mist border/tint. Used for "Cancel" or "Edit" actions.

### Input Fields
- **Numeric Keypad:** Large, high-tap-target buttons for amount entry with 1rem rounding. 
- **Text Inputs:** Subtle 1px border that thickens and changes to the primary Petal Pink color on focus.

### Cards
- Standard containers for "Recent Transactions" and "Statistics." 
- Cards should have a white background, 16px-24px padding, and 32px (2rem) rounded corners.

### Category Chips
- Circular icons (32px x 32px) with the category color (Petal Pink, Soft Lavender, or Sage) as the background.
- Inside the "Record List," these serve as the primary visual anchor for each row.

### Progress & Charts
- **Pie Charts:** Use the designated categorical colors (Petal Pink, Lavender, Sage) with a "donut" hole for displaying the "Total" in the center.
- **Bar Charts:** Minimalist cool-gray axes with Petal Pink bars for the "Trend" to emphasize growth and stability.

### Lists
- Grouped by date with a sticky header. 
- Each item has a 1px bottom border (Neutral-Variant) except for the last item in a group.