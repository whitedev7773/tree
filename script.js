// ==========================================
// [1] 눈 내리는 효과 (Snow Effect Logic)
// ==========================================
const snowCanvas = document.getElementById('snowCanvas');
const snowCtx = snowCanvas.getContext('2d');

let snowW = window.innerWidth;
let snowH = window.innerHeight;
snowCanvas.width = snowW;
snowCanvas.height = snowH;

const maxSnowflakes = 100; // 모바일 성능 고려하여 개수 제한
const snowflakes = [];

for (let i = 0; i < maxSnowflakes; i++) {
  snowflakes.push({
    x: Math.random() * snowW,
    y: Math.random() * snowH,
    r: Math.random() * 2 + 1, // 눈송이 크기
    d: Math.random() * maxSnowflakes, // 밀도 계산용 (속도에 영향)
  });
}

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
  requestAnimationFrame(drawSnow);
}

let angleSnow = 0;
function updateSnow() {
  angleSnow += 0.01;
  for (let i = 0; i < maxSnowflakes; i++) {
    const f = snowflakes[i];
    // 아래로 떨어지는 움직임 + 좌우 흔들림(sin)
    f.y += Math.cos(angleSnow + f.d) + 1 + f.r / 2;
    f.x += Math.sin(angleSnow) * 0.2;

    // 화면 밖으로 나가면 위로 리셋
    if (f.x > snowW + 5 || f.x < -5 || f.y > snowH) {
      if (i % 3 > 0) {
        snowflakes[i] = {
          x: Math.random() * snowW,
          y: -10,
          r: f.r,
          d: f.d,
        };
      } else {
        // 화면 오른쪽 끝에서 들어오는 느낌 추가
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

// 화면 크기 변경 시 캔버스 크기 재조정
window.addEventListener('resize', () => {
  snowW = window.innerWidth;
  snowH = window.innerHeight;
  snowCanvas.width = snowW;
  snowCanvas.height = snowH;
});

// 눈 애니메이션 시작
drawSnow();

// ==========================================
// [2] 기존 트리 로직 (Tree Logic)
// ==========================================
const toggleBtn = document.getElementById('toggleBtn');
const controlsPanel = document.getElementById('controlsPanel');

toggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  controlsPanel.classList.toggle('active');
  toggleBtn.innerHTML = controlsPanel.classList.contains('active') ? '✖' : '⚙️';
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

const dotContainer = document.getElementById('dot-container');

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

inputs.count.addEventListener('input', () =>
  updateLabel(inputs.count, 'dotsCountInput')
);
updateLabel(inputs.count, 'dotsCountInput');

let treeDots = [];
let angle = 0;
let opacity_min = 0.2;
let opacity_max = 1.0;
let animationId;

function initDots() {
  dotContainer.innerHTML = '';
  const count = parseInt(inputs.count.value, 10);

  for (let i = 0; i < count; i++) {
    const newDot = document.createElement('span');
    newDot.className = 'tree-dot';
    dotContainer.appendChild(newDot);
  }
  treeDots = Array.from(document.querySelectorAll('.tree-dot'));
}

inputs.count.addEventListener('input', initDots);

function animate() {
  const xOffset = parseInt(inputs.xOffset.value, 10);
  const yOffset = parseInt(inputs.yOffset.value, 10);
  const xScale = parseInt(inputs.xScale.value, 10);
  const yScale = parseInt(inputs.yScale.value, 10);
  const delayVal = parseInt(inputs.delay.value, 10);
  const dotGap = parseInt(inputs.gap.value, 10);
  const taper = parseInt(inputs.taper.value, 10);
  const baseSize = parseInt(inputs.size.value, 10);

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
    // 눈 내리는 효과와 겹치지 않게 z-index 조정 (눈은 0, 트리는 깊이에 따라 설정)
    // depth가 -1~1이므로 0~200 사이로 변환하여 눈(z-index: 0) 위아래로 배치가 가능하게 할 수도 있으나
    // 간단하게 눈보다 항상 위에 오도록 기본값을 높게 설정 (10 + ...)
    element.style.zIndex = 10 + Math.floor(depth * 100);
  });

  angle += 0.02;
  animationId = requestAnimationFrame(animate);
}

initDots();
animate();
