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
