// ui.js - UI controls and helpers
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

  function updateLabel(input, id) {
    const display = document.getElementById(`val_${id}`);
    if (display) display.innerText = input.value;
  }

  // initialize display for count
  updateLabel(inputs.count, 'dotsCountInput');

  return { toggleBtn, controlsPanel, inputs, updateLabel };
}
