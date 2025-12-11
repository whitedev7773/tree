/**
 * Main entry script which wires UI, snow animation, and tree animation together.
 * The script is loaded as an ES module by the HTML page.
 */
import { initSnow } from './src/snow.js';
import { initUI } from './src/ui.js';
import { initTree } from './src/tree.js';

// Initialize UI controls (toggle + inputs)
const ui = initUI();

/**
 * Parse query params and return a state object matching UI inputs.
 * @returns {Object<string,string>|null} Parsed state or null if none present
 */
// Load state from URL params if present
function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const allowed = [
    'count',
    'xOffset',
    'yOffset',
    'xScale',
    'yScale',
    'delay',
    'gap',
    'taper',
    'size',
  ];
  const found = {};
  for (const k of allowed) {
    if (params.has(k)) found[k] = params.get(k);
  }
  return Object.keys(found).length ? found : null;
}

const urlState = parseUrlState();
if (urlState) {
  ui.setState(urlState);
}

// Start snow animation
initSnow({ canvasSelector: '#snowCanvas', maxSnow: 100 });

// Start tree, passing inputs and label helper from UI
initTree({
  dotContainerSelector: '#dot-container',
  inputs: ui.inputs,
  updateLabel: ui.updateLabel,
});

// Share button wiring + modal helper
const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');
const shareModalMsg = document.getElementById('shareModalMsg');
const shareModalOk = document.getElementById('shareModalOk');
let lastFocusedElement = null;

/**
 * Open the share modal with the provided message and move focus to the OK button.
 * @param {string} message - Message to show in the modal (e.g., 'Copied!' or the full URL).
 */
function openModal(message) {
  if (!shareModal) return;
  shareModalMsg.textContent = message;
  shareModal.setAttribute('aria-hidden', 'false');
  lastFocusedElement = document.activeElement;
  // focus OK button for keyboard users
  shareModalOk.focus();
}

/**
 * Close the share modal and return focus to the previously focused element.
 */
function closeModal() {
  if (!shareModal) return;
  shareModal.setAttribute('aria-hidden', 'true');
  // return focus to triggering element
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

if (shareModalOk) {
  shareModalOk.addEventListener('click', closeModal);
}

if (shareModal) {
  // close on Esc (global listener) when modal is visible
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      shareModal.getAttribute('aria-hidden') === 'false'
    ) {
      closeModal();
    }
  });
}

if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const state = ui.getState();
    const params = new URLSearchParams(state).toString();
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    try {
      await navigator.clipboard.writeText(url);
      openModal('Copied!');
      // Update browser URL without reloading
      window.history.replaceState({}, '', `?${params}`);
    } catch (err) {
      // fallback: show the URL in the modal for manual copy
      openModal(url);
    }
  });
}
