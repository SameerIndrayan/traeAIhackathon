# UI Design Document - Tone Improver App

## 1. Layout
- **Header**: Simple title "Tone Improver" (Centered).
- **Main Content**:
  - **Top Control Bar**:
    - Tone Dropdown (Select).
    - "Improve" Button (Primary Color).
  - **Split View Area** (Side-by-Side):
    - **Left Panel**: "Original" label + Textarea (editable).
    - **Right Panel**: "Improved" label + Read-only display area (or readonly textarea for copy-ability).

## 2. Component Hierarchy
- `App`
  - `Layout` (Container)
    - `Header`
    - `ToneSelector`
    - `MessageInput`
    - `MessageOutput`

## 3. Styling (Tailwind)
- **Colors**:
  - Background: Neutral/Zinc.
  - Primary Action: Blue or Indigo (`bg-indigo-600`).
  - Text: Slate/Zinc (`text-zinc-800`).
- **Typography**: Clean sans-serif (Inter/system-ui).
- **Spacing**: Consistent padding (`p-4`, `p-6`).
- **Responsiveness**: Side-by-side on desktop (`md:flex-row`), stacked on mobile (`flex-col`).

## 4. Interaction States
- **Loading**: "Improve" button shows spinner or "Improving..." text. Right panel shows skeleton loader.
- **Empty**: Initial state shows empty input/output.
