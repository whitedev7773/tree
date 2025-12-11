// tree.js - tree dots, animation and input wiring
let animationId = null;
export function initTree({
  dotContainerSelector = '#dot-container',
  inputs,
  updateLabel,
}) {
  const dotContainer = document.querySelector(dotContainerSelector);
  if (!dotContainer) return { stop: () => {} };

  function updateLabelWrapper(inp, id) {
    if (updateLabel) updateLabel(inp, id);
  }

  const treeInputs = inputs;

  let treeDots = [];
  let angle = 0;
  let opacity_min = 0.2;
  let opacity_max = 1.0;

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

  function animate() {
    const xOffset = parseInt(treeInputs.xOffset.value, 10);
    const yOffset = parseInt(treeInputs.yOffset.value, 10);
    const xScale = parseInt(treeInputs.xScale.value, 10);
    const yScale = parseInt(treeInputs.yScale.value, 10);
    const delayVal = parseInt(treeInputs.delay.value, 10);
    const dotGap = parseInt(treeInputs.gap.value, 10);
    const taper = parseInt(treeInputs.taper.value, 10);
    const baseSize = parseInt(treeInputs.size.value, 10);

    const centerX = window.innerWidth / 2 + xOffset;
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
