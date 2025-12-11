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
 * @returns {{toggleBtn: Element, controlsPanel: Element, inputs: Inputs, updateLabel: function(HTMLInputElement, string): void}}
 */
export function initUI() {
  const toggleBtn = document.getElementById('toggleBtn');
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
      e.target !== toggleBtn
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

  return { toggleBtn, controlsPanel, inputs, updateLabel };
}
