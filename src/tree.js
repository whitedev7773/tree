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
  function getCenter() {
    const xOffset = parseInt(treeInputs.xOffset.value, 10);
    const yOffset = parseInt(treeInputs.yOffset.value, 10);
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    let sidebarOffset = 0;
    if (isDesktop) {
      const panel = document.querySelector('.controls');
      if (panel) {
        const rect = panel.getBoundingClientRect();
        sidebarOffset = rect.width / 2;
      }
    }
    const centerX = window.innerWidth / 2 + sidebarOffset + xOffset;
    const centerY = window.innerHeight / 2 + yOffset;
    return { centerX, centerY };
  }

  function animate() {
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
    const { centerX, centerY } = getCenter();
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

      // reposition any emojis relative to the tree center
      for (const meta of emojiMap.values()) {
        if (!meta || !meta.el) continue;
        const size =
          meta.size || parseInt(treeInputs.emojiSize?.value || 24, 10) || 24;
        // meta.rx/meta.ry stored as offsets relative to center
        const rx = typeof meta.rx === 'number' ? meta.rx : meta.x - centerX;
        const ry = typeof meta.ry === 'number' ? meta.ry : meta.y - centerY;
        meta.rx = rx;
        meta.ry = ry;
        const left = Math.round(centerX + rx - size / 2);
        const top = Math.round(centerY + ry - size / 2);
        meta.el.style.left = `${left}px`;
        meta.el.style.top = `${top}px`;
      }
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
     * Add an emoji decoration to a dot index. Emoji is placed at the current page position of the dot and is anchored by a relative offset (rx/ry) from the tree center so it moves with centering changes.
     * @param {number} index - index of the dot to decorate
     * @param {string|null} emoji - emoji char to set, or null to remove
     */
    addEmojiToDot(index, emoji, sizePx) {
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
      const { centerX, centerY } = getCenter();
      const rx = x - centerX;
      const ry = y - centerY;
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
      const emSize =
        typeof sizePx === 'number'
          ? sizePx
          : parseInt(treeInputs.emojiSize?.value || 24, 10) || 24;
      el.style.position = 'fixed';
      const { centerX: cX, centerY: cY } = getCenter();
      el.style.left = `${cX + rx - emSize / 2}px`;
      el.style.top = `${cY + ry - emSize / 2}px`;
      el.style.fontSize = `${emSize}px`;
      el.style.width = `${emSize}px`;
      el.style.height = `${emSize}px`;
      el.style.lineHeight = `${emSize}px`;
      el.style.textAlign = 'center';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 9999;
      el.dataset.emojiId = String(id);
      emojiMap.set(id, {
        el,
        x,
        y,
        rx,
        ry,
        emoji,
        dotIndex: index,
        size: emSize,
      });
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
      for (const meta of emojiMap.values()) {
        if (!meta || !meta.el) continue;
        meta.size = sizePx;
        meta.el.style.fontSize = `${sizePx}px`;
        meta.el.style.width = `${sizePx}px`;
        meta.el.style.height = `${sizePx}px`;
        meta.el.style.lineHeight = `${sizePx}px`;
        const { centerX, centerY } = getCenter();
        if (typeof meta.rx === 'number' && typeof meta.ry === 'number') {
          meta.el.style.left = `${Math.round(
            centerX + meta.rx - sizePx / 2
          )}px`;
          meta.el.style.top = `${Math.round(centerY + meta.ry - sizePx / 2)}px`;
        } else if (typeof meta.x === 'number' && typeof meta.y === 'number') {
          meta.el.style.left = `${Math.round(meta.x - sizePx / 2)}px`;
          meta.el.style.top = `${Math.round(meta.y - sizePx / 2)}px`;
        }
      }
    },
    getEmojiForDot(index) {
      const id = findEmojiIdByDotIndex(index);
      const meta = id ? emojiMap.get(id) : null;
      return meta ? meta.emoji : null;
    },
    /**
     * Return the current tree center coordinates.
     * @returns {{centerX:number,centerY:number}}
     */
    getCenter() {
      return getCenter();
    },
    /**
     * Return all emojis and their metadata for serialization.
     * @returns {Array<{x:number,y:number,emoji:string,size:number,dotIndex:number|null}>}
     */
    getAllEmojis() {
      const out = [];
      for (const meta of emojiMap.values()) {
        if (!meta) continue;
        out.push({
          rx: meta.rx,
          ry: meta.ry,
          emoji: meta.emoji,
          size: meta.size || 24,
          dotIndex: meta.dotIndex,
        });
      }
      return out;
    },
    /**
     * Add an emoji at an arbitrary page coordinate (clientX/clientY) and return id.
     * @param {number} x - clientX coordinate.
     * @param {number} y - clientY coordinate.
     * @param {string} emoji - emoji character.
     * @returns {number} id of inserted emoji
     */
    addEmojiAtPoint(x, y, emoji, sizePx) {
      if (!emoji) return null;
      const el = document.createElement('span');
      el.className = 'tree-emoji';
      el.textContent = emoji;
      document.body.appendChild(el);
      const id = emojiIdCounter++;
      const emSize =
        typeof sizePx === 'number'
          ? sizePx
          : parseInt(treeInputs.emojiSize?.value || 24, 10) || 24;
      el.style.position = 'fixed';
      // compute relative offset and set initial position based on tree center
      const { centerX, centerY } = getCenter();
      const rx = Math.round(x - centerX);
      const ry = Math.round(y - centerY);
      el.style.left = `${Math.round(centerX + rx - emSize / 2)}px`;
      el.style.top = `${Math.round(centerY + ry - emSize / 2)}px`;
      el.style.fontSize = `${emSize}px`;
      el.style.width = `${emSize}px`;
      el.style.height = `${emSize}px`;
      el.style.lineHeight = `${emSize}px`;
      el.style.textAlign = 'center';
      el.style.pointerEvents = 'none';
      el.style.zIndex = 9999;
      el.dataset.emojiId = String(id);
      emojiMap.set(id, {
        el,
        x,
        y,
        rx,
        ry,
        emoji,
        dotIndex: null,
        size: emSize,
      });
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
