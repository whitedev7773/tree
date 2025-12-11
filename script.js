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
  // prefer full base64-encoded state under 's'
  if (params.has('s')) {
    try {
      const decoded = base64DecodeUnicode(params.get('s'));
      const obj = JSON.parse(decoded);
      return obj;
    } catch (err) {
      // fallthrough to legacy behavior if parse fails
    }
  }
  // legacy support: simple query params (non-encoded)
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
    'em',
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
  // Ensure mutual exclusivity for UI after load
  if (
    ui.getEraserMode &&
    ui.getSelectedEmoji &&
    ui.getEraserMode() &&
    ui.getSelectedEmoji()
  ) {
    // prefer eraser (clear selected emoji)
    // clear emoji selection
    if (ui.setEraserMode) ui.setEraserMode(true);
  }
}
// (Emojis load moved below after `tree` is initialized.)

// --- encoding/decoding helpers for base64 JSON (Unicode-safe) ---
function base64EncodeUnicode(str) {
  // https://developer.mozilla.org/en-US/docs/Glossary/Base64
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode('0x' + p1);
    })
  );
}

function base64DecodeUnicode(str) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

// Start snow animation
initSnow({ canvasSelector: '#snowCanvas', maxSnow: 100 });

// Start tree, passing inputs and label helper from UI
const tree = initTree({
  dotContainerSelector: '#dot-container',
  inputs: ui.inputs,
  updateLabel: ui.updateLabel,
});

// Now load emojis if present in state (after tree is created). Supports both new 's' state and legacy 'em' param.
if (urlState && typeof tree.addEmojiAtPoint === 'function') {
  try {
    const center =
      typeof tree.getCenter === 'function'
        ? tree.getCenter()
        : { centerX: window.innerWidth / 2, centerY: window.innerHeight / 2 };
    const emojisList = Array.isArray(urlState.emojis) ? urlState.emojis : null;
    if (emojisList && emojisList.length > 0) {
      for (const em of emojisList) {
        const emoji = em.emoji;
        const size = Number(em.size) || undefined;
        let x, y;
        if (typeof em.rx !== 'undefined') {
          x = center.centerX + Number(em.rx);
          y = center.centerY + Number(em.ry);
        } else if (typeof em.x !== 'undefined' && typeof em.y !== 'undefined') {
          x = Number(em.x);
          y = Number(em.y);
        } else {
          continue;
        }
        tree.addEmojiAtPoint(x, y, emoji, size);
      }
    } else if (urlState.em) {
      // legacy: decode em base64 blob
      const json = base64DecodeUnicode(urlState.em);
      const emojis = JSON.parse(json);
      if (Array.isArray(emojis)) {
        for (const em of emojis) {
          const emoji = em.emoji;
          const size = Number(em.size) || undefined;
          let x, y;
          if (typeof em.rx !== 'undefined') {
            x = center.centerX + Number(em.rx);
            y = center.centerY + Number(em.ry);
          } else if (
            typeof em.x !== 'undefined' &&
            typeof em.y !== 'undefined'
          ) {
            x = Number(em.x);
            y = Number(em.y);
          } else {
            continue;
          }
          tree.addEmojiAtPoint(x, y, emoji, size);
        }
      }
    }
  } catch (err) {
    // ignore parsing errors
  }
}

// Clicking anywhere (outside UI) while an emoji is selected places it at that location
function isClickOnUI(target) {
  if (!target) return false;
  const uiElems = [
    document.getElementById('controlsPanel'),
    document.querySelector('.fab-actions'),
    shareModal,
  ];
  for (const el of uiElems) {
    if (!el) continue;
    if (el.contains(target)) return true;
  }
  return false;
}

document.addEventListener('click', (e) => {
  // ignore right clicks and clicks on UI
  if (e.button !== 0) return;
  // if clicked emoji and eraser mode, remove it
  const emojiEl = e.target.closest && e.target.closest('.tree-emoji');
  if (emojiEl) {
    const id =
      emojiEl.dataset && emojiEl.dataset.emojiId
        ? parseInt(emojiEl.dataset.emojiId, 10)
        : null;
    if (ui.getEraserMode()) {
      if (id !== null && typeof tree.removeEmojiById === 'function') {
        tree.removeEmojiById(id);
      }
      return;
    }
    // otherwise, do not place on top of existing emoji
    return;
  }
  if (isClickOnUI(e.target)) return;
  const sel = ui.getSelectedEmoji();
  if (!sel) return;
  const x = e.clientX;
  const y = e.clientY;
  tree.addEmojiAtPoint(x, y, sel);
});

// Initialize emoji size from UI and respond to changes
const initialEmojiSize = parseInt(ui.inputs.emojiSize.value, 10) || 24;
if (typeof tree.setEmojiSize === 'function')
  tree.setEmojiSize(initialEmojiSize);
ui.inputs.emojiSize.addEventListener('input', () => {
  const size = parseInt(ui.inputs.emojiSize.value, 10) || 24;
  if (typeof tree.setEmojiSize === 'function') tree.setEmojiSize(size);
});

// Share button wiring + modal helper
const shareBtn = document.getElementById('shareBtn');
const shareBtnDesktop = document.getElementById('shareBtnDesktop');
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

/**
 * Share current state by copying a URL with query string to clipboard.
 * Only UI control settings (via ui.getState) and emoji decorations (tree.getAllEmojis)
 * are encoded in `s`. Ephemeral UI states (emojiSize slider, selected emoji, eraser)
 * are intentionally excluded.
 */
async function shareCurrentState() {
  const state = ui.getState();
  const stateObj = { ...state };
  // include emoji placements
  if (typeof tree.getAllEmojis === 'function') {
    try {
      const emojis = tree.getAllEmojis();
      if (Array.isArray(emojis) && emojis.length > 0) stateObj.emojis = emojis;
    } catch (err) {
      // ignore
    }
  }
  const s = base64EncodeUnicode(JSON.stringify(stateObj));
  const params = new URLSearchParams({ s }).toString();
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
}

if (shareBtn) shareBtn.addEventListener('click', () => shareCurrentState());
if (shareBtnDesktop)
  shareBtnDesktop.addEventListener('click', () => shareCurrentState());

// wire UI callbacks for eraser and clear
if (ui.onEraserToggle)
  ui.onEraserToggle((on) => {
    if (tree.setEmojiInteractivity) tree.setEmojiInteractivity(on);
  });
if (ui.onClearAll)
  ui.onClearAll(() => {
    if (tree.removeAllEmojis) tree.removeAllEmojis();
  });
