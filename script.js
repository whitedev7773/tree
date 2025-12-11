/**
 * Main entry script which wires UI, snow animation, and tree animation together.
 * The script is loaded as an ES module by the HTML page.
 */
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
