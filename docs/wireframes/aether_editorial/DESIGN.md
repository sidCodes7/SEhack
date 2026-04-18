# Design System Specification

## 1. Overview & Creative North Star: "The Modern Curator"
This design system is anchored in the concept of **The Modern Curator**. It rejects the cluttered, utility-first density of traditional apps in favor of an airy, high-end editorial experience. It is designed to feel like a premium digital lookbook—where content is given room to breathe, and hierarchy is established through massive typographic shifts rather than structural clutter.

The system breaks the "template" look through:
*   **Intentional Asymmetry:** Layouts favor left-heavy typography with generous negative space on the right.
*   **Scale Contrast:** Hero displays are unapologetically large, creating an authoritative editorial voice.
*   **Tonal Architecture:** We use color and space to define boundaries, entirely removing the need for 1px lines or heavy shadows.

---

## 2. Colors & Surface Logic

The palette is a sophisticated blend of warm neutrals and "desaturated candy" pastels. It is designed to feel light and optimistic without being juvenile.

### The Palette
*   **Base Surface (`surface`):** `#F7F6F2` (A warm, gallery-style off-white).
*   **Primary Text (`on_surface`):** `#1A1A1A` (Near-black for high-contrast readability).
*   **Secondary Text (`on_surface_variant`):** `#6B6B6B` (A soft charcoal for metadata and captions).
*   **Signature Accent (`primary`):** `#1A1A1A` (Deep black used for high-impact CTAs).
*   **Karma/Status (`gold`):** `#D4A843` (Reserved strictly for value-based metrics).

### Editorial Accents (Card Fills)
These tokens are used as solid backgrounds for content containers to create a rhythmic, color-blocked layout:
*   **Lavender (`tertiary_container`):** `#EAE7F8`
*   **Sage (`secondary_container`):** `#D8EAE1`
*   **Cream:** `#F5F0D0`
*   **Dusty Pink:** `#F8E4E4`
*   **Pure White (`surface_container_lowest`):** `#FFFFFF`

### Core Principles
*   **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or generous vertical whitespace. 
*   **Surface Hierarchy & Nesting:** Treat the UI as a series of physical layers. Use the `surface-container` tiers (Lowest to Highest) to create depth. For example, a White (`#FFFFFF`) card should sit atop the Warm Off-White (`#F7F6F2`) background to create a "lift" without a shadow.
*   **Glassmorphism for Floating Elements:** To maintain the "airy" feel, floating navigation or overlay elements should use a semi-transparent `surface` color with a `20px` backdrop blur.

---

## 3. Typography: The Editorial Voice

We utilize **Plus Jakarta Sans** across the entire system. The hierarchy relies on extreme weight and scale differences to guide the eye.

| Level | Size | Weight | Line-Height | Alignment |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | 3.5rem | 800 (Bold) | 1.1 | Left |
| **Headline-LG** | 2.0rem | 700 (Bold) | 1.2 | Left |
| **Title-MD** | 1.125rem | 600 (Semi-Bold) | 1.4 | Left |
| **Body-LG** | 1.0rem | 400 (Regular) | 1.6 | Left |
| **Label-MD** | 0.75rem | 500 (Medium) | 1.2 | Left |

**Editorial Note:** Hero headers should use "Tight Line-Height" (1.1). When text is this large, traditional spacing feels disconnected. Tightening the leading makes the headline feel like a singular, powerful graphic element.

---

## 4. Elevation & Depth: Tonal Layering

This system rejects the "skeuomorphic" shadow. We convey hierarchy through **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Depth is achieved by "stacking" tones. 
    *   *Level 0:* `surface` (`#F7F6F2`)
    *   *Level 1:* Pastel Containers (e.g., Lavender `#EAE7F8`)
    *   *Level 2:* White `surface_container_lowest` (`#FFFFFF`)
*   **Ambient Shadows:** If an element *must* float (e.g., a modal or a primary action button), use a 20% opacity shadow tinted with the `on_surface` color, with a 40px blur. Never use pure grey or high-opacity shadows.
*   **The "Ghost Border" Fallback:** If a container requires further definition on a light background, use the `outline_variant` at **10% opacity**. It should be felt, not seen.

---

## 5. Component Logic

### Cards & Containers
*   **Corner Radius:** 32px (`xl`) for main containers; 24px (`lg`) for nested elements.
*   **Padding:** 24px internal padding is the minimum requirement. Content must never feel "trapped."
*   **Styling:** Flat solid fills only. Forbid the use of divider lines within cards. Use `16px` of vertical whitespace to separate header text from body text.

### Signature CTA (The "Aether" Button)
*   **Visuals:** A large 64px black (`#1A1A1A`) circle.
*   **Iconography:** A centered white arrow (`#FFFFFF`).
*   **Interaction:** Upon hover/active state, the circle expands slightly (1.05x) to provide tactile feedback without changing color.

### Input Fields
*   **Style:** Minimalist. No bounding box. A simple bottom-aligned `outline_variant` (20% opacity) with the label using `label-md` floating above the input.
*   **Error State:** Use `error` (`#a83836`) for the text, but the underline should remain subtle to avoid breaking the "airy" aesthetic.

### Selection Chips
*   **Style:** Pill-shaped (`full` roundedness).
*   **Colors:** Use `surface_container_high` for unselected and `primary` (Black) with `on_primary` (White) text for selected states.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** embrace massive amounts of whitespace. If a screen feels "empty," it’s likely working.
*   **Do** use asymmetrical margins. Offsetting a headline to the left while keeping the body text slightly indented creates a high-end, magazine-style rhythm.
*   **Do** mix the pastel card colors within a single scroll to maintain visual energy.

### Don’t:
*   **Don't** use 1px dividers. Use a 24px or 32px spacing gap instead.
*   **Don't** use center-aligned text for headlines. This system is built on a strong left-aligned axis to mimic editorial print.
*   **Don't** add shadows to the colored cards. The color itself is the boundary.
*   **Don't** use vibrant, saturated "neon" colors. Stick to the desaturated, warm palette provided to maintain the premium feel.

---

## 7. Spacing Scale
The system relies on a base-8 grid to ensure harmony:
*   **XS:** 4px (Icon padding)
*   **SM:** 8px (Label to Input)
*   **MD:** 16px (Element nesting)
*   **LG:** 24px (Standard Card Padding)
*   **XL:** 48px (Section spacing)
*   **XXL:** 64px (Hero to Content transition)