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
 * @property {HTMLInputElement} emojiSize
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
  onDotClick,
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
  const emojiMap = new Map(); // id -> metadata { el, x, y, emoji, dotIndex|null }
  let emojiIdCounter = 1;

  function findEmojiIdByDotIndex(index) {
    for (const [id, meta] of emojiMap.entries()) {
      if (meta && meta.dotIndex === index) return id;
    }
    return null;
  }

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
      // attach click handler to let outside code handle decoration addition
      // don't attach dot click handlers anymore; placement occurs anywhere on click
      dotContainer.appendChild(newDot);
    }
    treeDots = Array.from(dotContainer.querySelectorAll('.tree-dot'));

    // if dot count decreased, remove emoji entries that target removed indices
    // if dot count decreased, remove emoji entries anchored to dot indices that no longer exist
    for (const [id, meta] of Array.from(emojiMap.entries())) {
      if (
        meta &&
        typeof meta.dotIndex === 'number' &&
        meta.dotIndex >= treeDots.length
      ) {
        if (meta.el) meta.el.remove();
        emojiMap.delete(id);
      }
    }
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
      const baseZ = 10 + Math.floor(depth * 100);
      element.style.zIndex = baseZ;

      // emojis are static and are positioned on creation; nothing to do each frame
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
    /**
     * Add an emoji decoration to a dot index.
     * @param {number} index - index of the dot to decorate
     * @param {string|null} emoji - emoji char to set, or null to remove
     */
    /**
     * Add an emoji decoration to a dot index. Emoji is placed at the current page position of the dot and remains static.
     * @param {number} index - index of the dot to decorate
     * @param {string|null} emoji - emoji char to set, or null to remove
     */
    addEmojiToDot(index, emoji) {
      if (index < 0 || index >= treeDots.length) return;
      if (!emoji) {
        const existingId = findEmojiIdByDotIndex(index);
        if (existingId) {
          const meta = emojiMap.get(existingId);
          if (meta && meta.el) meta.el.remove();
          emojiMap.delete(existingId);
        }
        return;
      }
      const dotEl = treeDots[index];
      if (!dotEl) return;
      const rect = dotEl.getBoundingClientRect();
      const x = Math.round(rect.left + rect.width / 2);
      const y = Math.round(rect.top + rect.height / 2);
      const existingId = findEmojiIdByDotIndex(index);
      if (existingId) {
        const meta = emojiMap.get(existingId);
        if (meta && meta.el) meta.el.remove();
        emojiMap.delete(existingId);
      }
      const el = document.createElement('span');
      el.className = 'tree-emoji';
      el.textContent = emoji;
      document.body.appendChild(el);
      const id = emojiIdCounter++;
      const emSize = parseInt(treeInputs.emojiSize?.value || 24, 10) || 24;
      el.style.position = 'fixed';
      el.style.left = `${x - emSize / 2}px`;
      el.style.top = `${y - emSize / 2}px`;
      el.style.fontSize = `${emSize}px`;
      el.style.width = `${emSize}px`;
      el.style.height = `${emSize}px`;
      el.style.lineHeight = `${emSize}px`;
      el.style.textAlign = 'center';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 9999;
      el.dataset.emojiId = String(id);
      emojiMap.set(id, { el, x, y, emoji, dotIndex: index });
      // set interactivity according to default (none) - UI decides later
      el.style.pointerEvents = 'none';
      return id;
    },
    removeEmojiFromDot(index) {
      const id = findEmojiIdByDotIndex(index);
      if (id) {
        const meta = emojiMap.get(id);
        if (meta && meta.el) meta.el.remove();
        emojiMap.delete(id);
      }
    },
    /**
     * Update the size of all existing emojis.
     * @param {number} sizePx - font size in px for emojis
     */
    setEmojiSize(sizePx) {
      for (const el of emojiMap.values()) {
        el.style.fontSize = `${sizePx}px`;
        el.style.width = `${sizePx}px`;
        el.style.height = `${sizePx}px`;
        el.style.lineHeight = `${sizePx}px`;
      }
    },
    getEmojiForDot(index) {
      const id = findEmojiIdByDotIndex(index);
      const meta = id ? emojiMap.get(id) : null;
      return meta ? meta.emoji : null;
    },
    /**
     * Add an emoji at an arbitrary page coordinate (clientX/clientY) and return id.
     * @param {number} x - clientX coordinate.
     * @param {number} y - clientY coordinate.
     * @param {string} emoji - emoji character.
     * @returns {number} id of inserted emoji
     */
    addEmojiAtPoint(x, y, emoji) {
      if (!emoji) return null;
      const el = document.createElement('span');
      el.className = 'tree-emoji';
      el.textContent = emoji;
      document.body.appendChild(el);
      const id = emojiIdCounter++;
      const emSize = parseInt(treeInputs.emojiSize?.value || 24, 10) || 24;
      el.style.position = 'fixed';
      el.style.left = `${Math.round(x - emSize / 2)}px`;
      el.style.top = `${Math.round(y - emSize / 2)}px`;
      el.style.fontSize = `${emSize}px`;
      el.style.width = `${emSize}px`;
      el.style.height = `${emSize}px`;
      el.style.lineHeight = `${emSize}px`;
      el.style.textAlign = 'center';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 9999;
      emojiMap.set(id, { el, x, y, emoji, dotIndex: null });
      el.dataset.emojiId = String(id);
      el.style.pointerEvents = 'none';
      return id;
    },
    removeEmojiById(id) {
      const meta = emojiMap.get(id);
      if (meta) {
        if (meta.el) meta.el.remove();
        emojiMap.delete(id);
      }
    },
    /**
     * Remove all emojis.
     */
    removeAllEmojis() {
      for (const [id, meta] of Array.from(emojiMap.entries())) {
        if (meta && meta.el) meta.el.remove();
        emojiMap.delete(id);
      }
    },
    /**
     * Set pointer-events for all emojis to enable eraser interactivity.
     * @param {boolean} enabled
     */
    setEmojiInteractivity(enabled) {
      for (const meta of emojiMap.values()) {
        if (!meta || !meta.el) continue;
        meta.el.style.pointerEvents = enabled ? 'auto' : 'none';
        // optionally reflect a cursor change
        meta.el.style.cursor = enabled ? 'pointer' : 'default';
      }
    },
  };
}
