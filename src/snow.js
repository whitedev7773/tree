/**
 * Snow animation module.
 * @module snow
 */

/**
 * Initialize a snow animation on a canvas element.
 * @param {Object} [options] Configuration options
 * @param {string} [options.canvasSelector='#snowCanvas'] - CSS selector for canvas.
 * @param {number} [options.maxSnow=100] - Maximum number of snowflakes.
 * @returns {{stop: function(): void}} An object with a `stop` method to cancel animation and cleanup.
 */
export function initSnow({
  canvasSelector = '#snowCanvas',
  maxSnow = 100,
} = {}) {
  const snowCanvas = document.querySelector(canvasSelector);
  if (!snowCanvas) return { stop: () => {} };
  const snowCtx = snowCanvas.getContext('2d');

  let snowW = window.innerWidth;
  let snowH = window.innerHeight;
  snowCanvas.width = snowW;
  snowCanvas.height = snowH;

  const maxSnowflakes = maxSnow;
  const snowflakes = [];

  for (let i = 0; i < maxSnowflakes; i++) {
    snowflakes.push({
      x: Math.random() * snowW,
      y: Math.random() * snowH,
      r: Math.random() * 2 + 1,
      d: Math.random() * maxSnowflakes,
    });
  }

  /**
   * Render a single animation frame of the snow.
   * @private
   */
  function drawSnow() {
    snowCtx.clearRect(0, 0, snowW, snowH);
    snowCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    snowCtx.beginPath();

    for (let i = 0; i < maxSnowflakes; i++) {
      const f = snowflakes[i];
      snowCtx.moveTo(f.x, f.y);
      snowCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
    }
    snowCtx.fill();
    updateSnow();
    animationId = window.requestAnimationFrame(drawSnow);
  }

  let angleSnow = 0;
  /**
   * Update internal snowflake positions for the next frame.
   * @private
   */
  function updateSnow() {
    angleSnow += 0.01;
    for (let i = 0; i < maxSnowflakes; i++) {
      const f = snowflakes[i];
      f.y += Math.cos(angleSnow + f.d) + 1 + f.r / 2;
      f.x += Math.sin(angleSnow) * 0.2;

      if (f.x > snowW + 5 || f.x < -5 || f.y > snowH) {
        if (i % 3 > 0) {
          snowflakes[i] = {
            x: Math.random() * snowW,
            y: -10,
            r: f.r,
            d: f.d,
          };
        } else {
          if (Math.sin(angleSnow) > 0) {
            snowflakes[i] = {
              x: -5,
              y: Math.random() * snowH,
              r: f.r,
              d: f.d,
            };
          } else {
            snowflakes[i] = {
              x: snowW + 5,
              y: Math.random() * snowH,
              r: f.r,
              d: f.d,
            };
          }
        }
      }
    }
  }

  /**
   * Resize handler to keep canvas matching window size.
   * @private
   */
  function handleResize() {
    snowW = window.innerWidth;
    snowH = window.innerHeight;
    snowCanvas.width = snowW;
    snowCanvas.height = snowH;
  }

  window.addEventListener('resize', handleResize);

  let animationId = null;
  drawSnow();

  return {
    stop() {
      if (animationId) window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    },
  };
}
