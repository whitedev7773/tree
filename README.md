# Tree Project — Module Refactor

This small project has been refactored to use ES modules for better maintainability.

- `script.js` — Entry module (type="module"). Imports and initializes submodules.
- `src/snow.js` — Snow canvas animation logic (`initSnow`).
- `src/ui.js` — UI controls, toggle, and label helper (`initUI`).
- `src/tree.js` — Tree dots animation and input wiring (`initTree`).

How to run:

1. Open `index.html` in a modern browser (serve with a local static server for module imports):

```
# Basic Python server
python -m http.server 8000
open http://localhost:8000
```

2. Interact with controls and verify the tree and snow animations.

Share and Load State via URL

- After adjusting sliders, click "Share State" to copy a link that encodes current control values.
- Visiting that URL will load the sliders' values from the query string into the app.

When clicking the share button, a confirmation modal will appear with "Copied!" and an OK button.

Responsive behavior

- On larger screens (desktop), the controls are displayed as a left-side dashboard and are always visible.
- On smaller screens (mobile), the controls remain as a bottom drawer and are toggled with the settings button.

Emoji Decorations

- Use the emoji palette at the top of the controls to select a decoration.
- Click a tree dot to place the selected emoji there; clicking a dot with the same emoji removes it (toggle).
- Click anywhere on the canvas (outside the UI) to place the selected emoji at the clicked position; previously dot clicks were required.
- Emojis are static decorations — once placed they do not move with the dots and are rendered above them.

Notes:

- Use the Emoji Size slider in the controls to change the size of icons.
- Since the tree layout changes between mobile and desktop, emoji placements are based on the dot position at the moment of placement; switching layout later can cause visual offsets.

Eraser Mode & Clear

- Use the Erase button in the emoji palette to toggle eraser mode. When on, clicking an emoji (on the screen) removes it.
- Use Clear All to remove all placed emojis at once.

Mode Exclusivity

- Only one mode can be active: either an emoji is selected or the eraser mode is on. Selecting an emoji automatically disables eraser; turning on eraser clears the emoji selection.

Example: - http://localhost:8000/?count=50&xOffset=0&yOffset=-350&xScale=200&yScale=20&delay=2500&gap=10&taper=4&size=10
