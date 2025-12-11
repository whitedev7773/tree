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
 */

/**
 * Initialize UI controls and return useful references.
 * @returns {{toggleBtn: Element, controlsPanel: Element, inputs: Inputs, updateLabel: function(HTMLInputElement, string): void, getState: function(): Object, setState: function(Object): void}}
 */
export function initUI() {
  const toggleBtn = document.getElementById('toggleBtn');
  const shareBtn = document.getElementById('shareBtn');
  const controlsPanel = document.getElementById('controlsPanel');

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
      updateLabel(inputs[k], k === 'count' ? 'dotsCountInput' : k);
      // Dispatch input event so other listeners respond
      inputs[k].dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  return { toggleBtn, controlsPanel, inputs, updateLabel, getState, setState };
}
