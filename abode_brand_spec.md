2# ABODE Frontend Brand System Specification

## Brand Overview
ABODE is a premium Scottish new-build property brand with an architectural luxury aesthetic.

**Positioning:** Quiet luxury, architectural precision, premium residential living.

---

## Logo System

### Primary Logo
- Wordmark: `ABODE`
- Icon: Geometric roofline / house form
- Layout: Centered icon above wordmark

### Variants
1. Light version (dark logo on ivory)
2. Dark version (gold icon + white wordmark on charcoal)
3. Gold panel version (white logo on gold)

---

## Brand Messaging

Primary tagline:
> ALL NEW BUILD HOMES IN SCOTLAND

Secondary:
> FIND YOUR HUMBLE ABODE

Launch statement:
> A New Chapter. A New Standard.

---

## Brand Colours (HEX)

### Core Palette

- Gold Accent: `#C8A066`
- Charcoal: `#1B2B2B`
- Mid Grey: `#6B6B6B`
- Warm Stone: `#E7E1D9`
- Soft Ivory: `#F6F3EF`

---

## CSS Variables

```css
:root {
  --abode-gold: #C8A066;
  --abode-charcoal: #1B2B2B;
  --abode-grey: #6B6B6B;
  --abode-stone: #E7E1D9;
  --abode-ivory: #F6F3EF;
}
```

---

## Typography

### Headline
Cormorant Garamond

```css
font-family: "Cormorant Garamond", serif;
```

### UI / Body
Montserrat

```css
font-family: "Montserrat", sans-serif;
```

---

## UI Rules

### Buttons
- Square corners
- Uppercase
- Letter spacing: 0.12em

Primary:
- Background: #1B2B2B
- Text: #F6F3EF

Hover:
- Background: #C8A066

---

## Cards
- Border: 1px solid #E7E1D9
- Shadow: subtle
- No rounded corners

---

## Animation

Allowed:
- Fade-up
- Slow opacity transitions
- Gold underline reveal

Avoid:
- Bounce
- Oversized motion
- Neon gradients
- Playful easing

---

## Layout Style

Spacing:
- Large whitespace
- Editorial luxury spacing rhythm
- Thin dividers

Section backgrounds rotate:
1. #F6F3EF
2. #FFFFFF
3. #E7E1D9
4. #1B2B2B

---

## Visual Inspiration

Target aesthetic:
- Luxury architecture journals
- Boutique hospitality websites
- Premium interior design editorials

Avoid:
- Generic property portal layouts
- Bright modern SaaS styles
- Rounded consumer-tech UI

---

## Brand Personality

- Refined
- Quiet confidence
- Timeless
- Architectural
- Elevated simplicity
- Trustworthy
