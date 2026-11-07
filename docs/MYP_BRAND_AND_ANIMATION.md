# MYP Brand & Hero Pipeline Animation Architecture

This document outlines the brand assets, components, motion principles, and configuration options built for **MYP (Manage Your Priorities)**.

---

## 1. Brand Mark: "The Convergence Y"

### Concept & Geometry
The letter **Y** functions as an intuitive funnel: two upper arms merge into one central stem, symbolizing how scattered inbound contacts, emails, WhatsApp inquiries, and calls converge into a single organized management pipeline.

* **File**: `src/components/brand/MypLogo.tsx`
* **Favicon**: `public/favicon.svg` and `src/app/icon.svg`
* **ViewBox**: `0 0 48 48`
* **Container**: Rounded rectangle with `rx = 12` and a subtle diagonal slate gradient (`#1E293B` ➔ `#0F172A` ➔ `#020617`).
* **Upper Arms**: Thick rounded strokes (`strokeWidth = 4.6`, `strokeLinecap = round`) curving inward.
* **Top Nodes**: Two solid contact nodes (`cx=14.5, cy=13.5` and `cx=33.5, cy=13.5`) representing inbound leads.
* **Floating Arrival Node**: A third smaller node (`cx=24, cy=9.5, r=1.6`) floating above the center, indicating continuous inflow (optically dropped at small sizes `≤ 22px`).
* **Stem & Output**: Central stem ending in a filled circle (`cx=24, cy=34.5, r=4.3`) containing a clean checkmark, representing converted/managed results.
* **Micro-Interaction**: On hover, the two upper nodes slide down into the stem (300ms ease-out) while the bottom check circle pulses with a subtle scale pop.

### Available Variants & Props
```tsx
import MypLogo from '@/components/brand/MypLogo';

// Standalone icon mark (36px default)
<MypLogo size={36} variant="mark" />

// Full wordmark with brand tagline
<MypLogo size={42} variant="full" showTagline={true} theme="light" />

// Alternate Concept A: "Orbit" (core dot + orbiting nodes)
<MypLogo size={36} iconStyle="orbit" />

// Alternate Concept B: "Stacked Pipeline" (stacked funnel bars + checkmark)
<MypLogo size={36} iconStyle="stacked" />
```

---

## 2. Hero Pipeline Animation: "From Chaos to Pipeline"

### Component Architecture
* **Main Container**: `src/components/hero/HeroPipelineAnimation.tsx`
* **Subcomponents**:
  * `InputChip.tsx`: Floating inbound items with soft shadow and micro status indicator.
  * `HubCenter.tsx`: The MYP Hub with frosted glass circle, concentric counter-rotating dashed rings, and absorb pulse wave.
  * `MiniKanban.tsx`: 4-column live pipeline (`New`, `Contacted`, `Qualified`, `Won`) with Framer Motion `layoutId` transitions.
  * `MiniProjectCard.tsx`: Milestone progress bar (62% ➔ 74%) with overlapping partner avatar stack.
  * `MiniCalendar.tsx`: 5-day week strip with drop-in meeting card and subtle wiggling notification bell.
  * `StatBadge.tsx`: Self-drawing SVG sparkline with live conversion rate roll (`↑ 18%` ➔ `↑ 19%`) and subtle confetti particle burst.
* **Sample Data Pool**: `src/components/hero/sampleData.ts` (includes localized Pakistan market references: Ahmed Raza, Sana Malik, Bilal Khan, Bahria Heights Phase 2, DHA Plaza).

---

## 3. Customization Guide

### A. Adjusting Timeline & Animation Timings
All timings are coordinated through a single master state machine in [`src/components/hero/HeroPipelineAnimation.tsx`](file:///d:/Contatct%20Manager/contacthub/src/components/hero/HeroPipelineAnimation.tsx):

```typescript
const STEP_TIMINGS = [
  { step: 0, delay: 0 },     // 0.0s Idle float
  { step: 1, delay: 600 },   // 0.6s Chip 1 flies toward hub along Bezier path
  { step: 2, delay: 1400 },  // 1.4s Hub absorbs chip with expanding glow wave
  { step: 3, delay: 1700 },  // 1.7s New card emitted into Kanban "New" (4 ➔ 5)
  { step: 4, delay: 2600 },  // 2.6s Contacted card slides into Qualified
  { step: 5, delay: 3400 },  // 3.4s Chip 2 absorbed ➔ Calendar meeting booked
  { step: 6, delay: 5000 },  // 5.0s Project milestone progress bars to 74%
  { step: 7, delay: 6000 },  // 6.0s Qualified card moves to Won + Confetti burst
  { step: 8, delay: 7000 },  // 7.0s New incoming chips fade in
  { step: 9, delay: 9000 },  // 9.0s Loop cycle restarts with next data item
];
```
* To make the sequence faster: decrease the `delay` values proportionally (e.g. 7-second loop).
* To hold any stage longer: increase the duration between steps.

### B. Adding Custom Sample Chips & Projects
Edit [`src/components/hero/sampleData.ts`](file:///d:/Contatct%20Manager/contacthub/src/components/hero/sampleData.ts):
* Add new chips to `SAMPLE_CHIPS_POOL` with custom titles, badges, and icons.
* Add or customize project milestones in `SAMPLE_PROJECTS`.

### C. Performance & Accessibility
* **Reduced Motion**: Automatically pauses travel animations when `prefers-reduced-motion` is enabled, presenting a calm static resting frame.
* **Auto-Pause**: `IntersectionObserver` halts all timers when the hero is out of view; `visibilitychange` halts execution when switching browser tabs.
* **60 FPS Hardware Acceleration**: Moving cards and particles use `will-change: transform` and avoid expensive layout repaints.

