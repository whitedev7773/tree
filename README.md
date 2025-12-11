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

Example: - http://localhost:8000/?count=50&xOffset=0&yOffset=-350&xScale=200&yScale=20&delay=2500&gap=10&taper=4&size=10
