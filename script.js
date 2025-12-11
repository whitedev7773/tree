import { initSnow } from './src/snow.js';
import { initUI } from './src/ui.js';
import { initTree } from './src/tree.js';

// Initialize UI controls (toggle + inputs)
const ui = initUI();

// Start snow animation
initSnow({ canvasSelector: '#snowCanvas', maxSnow: 100 });

// Start tree, passing inputs and label helper from UI
initTree({
  dotContainerSelector: '#dot-container',
  inputs: ui.inputs,
  updateLabel: ui.updateLabel,
});
