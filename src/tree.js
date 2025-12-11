/**
 * Tree module which manages tree dot creation and animation.
 * @module tree
 */

/**
 * @typedef {Object} TreeInputs
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

let animationId = null;

/**
 * Initialize the tree animation and wire inputs.
 * @param {Object} options
 * @param {string} [options.dotContainerSelector='#dot-container'] - CSS selector for dot container.
 * @param {TreeInputs} options.inputs - The control inputs.
 * @param {function(HTMLInputElement,string): void} [options.updateLabel] - Optional label update function from UI.
 * @returns {{stop: function(): void}} Stop function that cancels animation and removes listeners.
 */
export function initTree({
  dotContainerSelector = '#dot-container',
  inputs,
  updateLabel,
}) {
  const dotContainer = document.querySelector(dotContainerSelector);
  if (!dotContainer) return { stop: () => {} };

  /**
   * Small wrapper around the provided `updateLabel` function that checks for existence.
   * @param {HTMLInputElement} inp
   * @param {string} id
   * @private
   */
  function updateLabelWrapper(inp, id) {
    if (updateLabel) updateLabel(inp, id);
  }

  const treeInputs = inputs;

  let treeDots = [];
  let angle = 0;
  let opacity_min = 0.2;
  let opacity_max = 1.0;

  /**
   * Initialize/replace the tree dots inside the container based on `count` input.
   * @private
   */
  function initDots() {
    dotContainer.innerHTML = '';
    const count = parseInt(treeInputs.count.value, 10);
    for (let i = 0; i < count; i++) {
      const newDot = document.createElement('span');
      newDot.className = 'tree-dot';
      dotContainer.appendChild(newDot);
    }
    treeDots = Array.from(dotContainer.querySelectorAll('.tree-dot'));
  }

  /**
   * Animation loop which positions and styles dots on each frame.
   * @private
   */
  function animate() {
    const xOffset = parseInt(treeInputs.xOffset.value, 10);
    const yOffset = parseInt(treeInputs.yOffset.value, 10);
    const xScale = parseInt(treeInputs.xScale.value, 10);
    const yScale = parseInt(treeInputs.yScale.value, 10);
    const delayVal = parseInt(treeInputs.delay.value, 10);
    const dotGap = parseInt(treeInputs.gap.value, 10);
    const taper = parseInt(treeInputs.taper.value, 10);
    const baseSize = parseInt(treeInputs.size.value, 10);

    // If controls are visible as a left sidebar on desktop, offset the tree center
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    let sidebarOffset = 0;
    if (isDesktop) {
      const panel = document.querySelector('.controls');
      if (panel) {
        const rect = panel.getBoundingClientRect();
        // Add half of the panel width to the center calculation so the tree centers in the remaining area
        sidebarOffset = rect.width / 2;
      }
    }
    const centerX = window.innerWidth / 2 + sidebarOffset + xOffset;
    const centerY = window.innerHeight / 2 + yOffset;
    const totalDots = treeDots.length;

    treeDots.forEach((element, index) => {
      const delay = (delayVal / totalDots) * index;
      const currentAngle = angle - delay * 0.01;

      const radiusModifier = taper * (totalDots - index);
      const currentRadius = xScale - radiusModifier;

      const x = centerX + currentRadius * Math.cos(currentAngle);
      const y = centerY + yScale * Math.sin(currentAngle);
      const topPos = y + dotGap * index;

      const depth = Math.sin(currentAngle);

      const opacity =
        opacity_min + ((opacity_max - opacity_min) * (1 + depth)) / 2;

      element.style.transform = `translate(${x}px, ${topPos}px)`;
      element.style.width = `${baseSize}px`;
      element.style.height = `${baseSize}px`;
      element.style.opacity = opacity;
      element.style.zIndex = 10 + Math.floor(depth * 100);
    });

    angle += 0.02;
    animationId = requestAnimationFrame(animate);
  }

  // wire inputs
  treeInputs.count.addEventListener('input', () => {
    updateLabelWrapper(treeInputs.count, 'dotsCountInput');
    initDots();
  });

  // initialize
  updateLabelWrapper(treeInputs.count, 'dotsCountInput');
  initDots();
  animate();

  window.addEventListener('resize', initDots);

  return {
    stop() {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', initDots);
    },
  };
}
