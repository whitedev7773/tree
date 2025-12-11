/**
 * UI module for the settings panel and control elements.
 * @module ui
 */

/**
 * @typedef {Object} Inputs
 * @property {HTMLInputElement} count
 * @property {HTMLInputElement} xOffset
 * @property {HTMLInputElement} yOffset
 * @property {HTMLInputElement} xScale
 * @property {HTMLInputElement} yScale
 * @property {HTMLInputElement} delay
 * @property {HTMLInputElement} gap
 * @property {HTMLInputElement} taper
 * @property {HTMLInputElement} size
 * @property {HTMLInputElement} emojiSize
 */

/**
 * Initialize UI controls and return useful references.
 * @returns {{toggleBtn: Element, controlsPanel: Element, inputs: Inputs, updateLabel: function(HTMLInputElement, string): void, getState: function(): Object, setState: function(Object): void}}
 */
export function initUI() {
  const toggleBtn = document.getElementById('toggleBtn');
  const shareBtn = document.getElementById('shareBtn');
  const controlsPanel = document.getElementById('controlsPanel');
  const emojiPalette = document.getElementById('emojiPalette');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearEmojisBtn = document.getElementById('clearEmojisBtn');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    controlsPanel.classList.toggle('active');
    toggleBtn.innerHTML = controlsPanel.classList.contains('active')
      ? '✖'
      : '⚙️';
  });

  document.body.addEventListener('click', (e) => {
    if (
      controlsPanel.classList.contains('active') &&
      !controlsPanel.contains(e.target) &&
      !toggleBtn.contains(e.target) &&
      !(shareBtn && shareBtn.contains(e.target))
    ) {
      controlsPanel.classList.remove('active');
      toggleBtn.innerHTML = '⚙️';
    }
  });

  // Exclude emoji palette when clicking outside
  if (emojiPalette) {
    // Setup handlers in emoji palette to manage selected state
  }

  const inputs = {
    count: document.getElementById('dotsCountInput'),
    xOffset: document.getElementById('xOffsetSlider'),
    yOffset: document.getElementById('yOffsetSlider'),
    xScale: document.getElementById('xScaleSlider'),
    yScale: document.getElementById('yScaleSlider'),
    delay: document.getElementById('delaySlider'),
    gap: document.getElementById('dotGapSlider'),
    taper: document.getElementById('dotXSmallerOffsetSlider'),
    size: document.getElementById('dotSizeSlider'),
    emojiSize: document.getElementById('emojiSizeSlider'),
  };

  /**
   * Update the visible label for a range input.
   * @param {HTMLInputElement} input - The input element whose value to display.
   * @param {string} id - The input id used to resolve the display span (val_${id}).
   */
  function updateLabel(input, id) {
    const display = document.getElementById(`val_${id}`);
    if (display) display.innerText = input.value;
  }

  // initialize display for count
  updateLabel(inputs.count, 'dotsCountInput');
  updateLabel(inputs.size, 'dotSizeSlider');
  updateLabel(inputs.emojiSize, 'emojiSizeSlider');

  // Update display for size inputs on change
  inputs.size.addEventListener('input', () =>
    updateLabel(inputs.size, 'dotSizeSlider')
  );
  inputs.emojiSize.addEventListener('input', () =>
    updateLabel(inputs.emojiSize, 'emojiSizeSlider')
  );

  /**
   * Get the current state from inputs as a plain object of values.
   * @returns {Object<string, string|number>}
   */
  /**
   * Return a simple object representing current input values that can be serialized.
   * @returns {{count: string, xOffset: string, yOffset: string, xScale: string, yScale: string, delay: string, gap: string, taper: string, size: string}}
   */
  function getState() {
    return {
      count: inputs.count.value,
      xOffset: inputs.xOffset.value,
      yOffset: inputs.yOffset.value,
      xScale: inputs.xScale.value,
      yScale: inputs.yScale.value,
      delay: inputs.delay.value,
      gap: inputs.gap.value,
      taper: inputs.taper.value,
      size: inputs.size.value,
      emojiSize: inputs.emojiSize.value,
      eraser: eraserBtn
        ? eraserBtn.getAttribute('aria-pressed') === 'true'
        : false,
    };
  }

  /**
   * Apply a plain object state to the inputs. Non-present fields are ignored.
   * @param {Object<string, string|number>} state
   */
  /**
   * Set inputs from an object. This will update labels and dispatch `input` events for listeners.
   * @param {Object<string, string|number>} state - Keys correspond to input names (count, xOffset, ...).
   */
  function setState(state = {}) {
    Object.keys(state).forEach((k) => {
      if (!inputs[k]) return;
      inputs[k].value = String(state[k]);
      updateLabel(inputs[k], inputs[k].id);
      // Dispatch input event so other listeners respond
      inputs[k].dispatchEvent(new Event('input', { bubbles: true }));
    });
    // Apply eraser state if given
    if (typeof state.eraser !== 'undefined' && eraserBtn) {
      const on = state.eraser === 'true' || state.eraser === true;
      setEraserMode(on);
    }
  }

  // selected emoji management
  let selectedEmoji = null;
  const emojiCallbacks = [];
  const eraserCallbacks = [];
  const clearCallbacks = [];
  const emojiButtons = Array.from(document.querySelectorAll('.emoji-btn'));
  emojiButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // toggle selection
      const value = btn.getAttribute('data-emoji');
      if (selectedEmoji === value) {
        selectedEmoji = null;
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        // deactivate other buttons
        emojiButtons.forEach((b) => b.classList.remove('active'));
        selectedEmoji = value;
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }
      // If eraser was active, disable it when selecting an emoji
      if (eraserBtn && eraserBtn.getAttribute('aria-pressed') === 'true') {
        eraserBtn.setAttribute('aria-pressed', 'false');
        eraserBtn.classList.remove('active');
        eraserCallbacks.forEach((cb) => cb(false));
      }
      // notify callbacks
      emojiCallbacks.forEach((cb) => cb(selectedEmoji));
    });
  });

  // Eraser button handling
  if (eraserBtn) {
    eraserBtn.addEventListener('click', () => {
      const pressed = eraserBtn.getAttribute('aria-pressed') === 'true';
      const newVal = !pressed;
      eraserBtn.setAttribute('aria-pressed', newVal ? 'true' : 'false');
      eraserBtn.classList.toggle('active', newVal);
      if (newVal) {
        // disable emoji selection when eraser enabled
        selectedEmoji = null;
        emojiButtons.forEach((b) => b.classList.remove('active'));
        emojiCallbacks.forEach((cb) => cb(null));
      }
      eraserCallbacks.forEach((cb) => cb(newVal));
    });
  }

  // Clear all button handling
  if (clearEmojisBtn) {
    clearEmojisBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearCallbacks.forEach((cb) => cb());
    });
  }

  function onEmojiSelected(cb) {
    if (typeof cb === 'function') emojiCallbacks.push(cb);
  }

  function onEraserToggle(cb) {
    if (typeof cb === 'function') eraserCallbacks.push(cb);
  }

  function onClearAll(cb) {
    if (typeof cb === 'function') clearCallbacks.push(cb);
  }

  function getSelectedEmoji() {
    return selectedEmoji;
  }

  function setEraserMode(on) {
    if (!eraserBtn) return;
    eraserBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    eraserBtn.classList.toggle('active', on);
    if (on) {
      selectedEmoji = null;
      emojiButtons.forEach((b) => b.classList.remove('active'));
      emojiCallbacks.forEach((cb) => cb(null));
    }
  }

  function getEraserMode() {
    return eraserBtn?.getAttribute('aria-pressed') === 'true';
  }

  return {
    toggleBtn,
    controlsPanel,
    inputs,
    updateLabel,
    getState,
    setState,
    onEmojiSelected,
    getSelectedEmoji,
    onEraserToggle,
    onClearAll,
    setEraserMode,
    getEraserMode,
  };
}
