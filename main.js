const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const countdownEl = document.getElementById('countdown');
const resultEl = document.getElementById('result');
const MIN_RADIUS = 50;
const MAX_RADIUS = 60;
const MARGIN = 20;

const fullscreenBtn = document.getElementById('fullscreenBtn');
let objects = [];
let currentNumber = 1;
let startTime = null;
let isRunning = false;
let numbers = Array.from({ length: 25 }, (_, i) => i + 1);



fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      alert(`フルスクリーンにできませんでした: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});


startBtn.addEventListener('click', () => {
  startBtn.style.display = "none";
  document.getElementById('intro').style.display = "none";
  resultEl.textContent = "";
  countdown(3);
});

function countdown(seconds) {
  countdownEl.textContent = seconds;
  countdownEl.style.display = "block";

  if (seconds > 0) {
    setTimeout(() => countdown(seconds - 1), 1000);
  } else {
    countdownEl.style.display = "none";
    overlay.style.display = "none"; // ゲーム開始
    startGame();
  }
}

function startGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects = [];
  currentNumber = 1;
  startTime = performance.now();
  isRunning = true;

  let shuffled = [...numbers].sort(() => Math.random() - 0.5);

  for (let number of shuffled) {
    const radius = getRandom(MIN_RADIUS, MAX_RADIUS);
    let x, y, attempts = 0;

    do {
      x = getRandom(radius + MARGIN, canvas.width - radius - MARGIN);
      y = getRandom(radius + MARGIN, canvas.height - radius - MARGIN);
      attempts++;
      if (attempts > 1000) break;
    } while (checkOverlap(x, y, radius, objects));

    drawCircleWithNumber(x, y, radius, number);
    objects.push({ number, x, y, radius, clicked: false });
  }
}

function drawCircleWithNumber(x, y, radius, number) {
  ctx.beginPath();
  ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
  ctx.fillStyle = '#a0d8ef';
  ctx.fill();

  ctx.font = `${radius * 1.8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';
  ctx.fillText(number.toString(), x, y);
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function checkOverlap(x, y, radius, objects) {
  for (let obj of objects) {
    const dx = obj.x - x;
    const dy = obj.y - y;
    const distance = Math.hypot(dx, dy);
    if (distance < obj.radius + radius + MARGIN) return true;
  }
  return false;
}

canvas.addEventListener('click', (event) => {
  if (!isRunning) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let obj of objects) {
    if (obj.clicked) continue;

    const dx = obj.x - x;
    const dy = obj.y - y;
    const distance = Math.hypot(dx, dy);

    if (distance <= obj.radius) {
      if (obj.number === currentNumber) {
        obj.clicked = true;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#cccccc';
        ctx.fill();

        ctx.font = `${obj.radius * 1.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'gray';
        ctx.fillText(obj.number.toString(), obj.x, obj.y);

        currentNumber++;
        if (currentNumber > 25) {
          const duration = ((performance.now() - startTime) / 1000).toFixed(2);
          endGame(duration);
        }
      }
      break;
    }
  }
});

function endGame(duration) {
  isRunning = false;
  overlay.style.display = "flex";
  overlay.style.background = "black";
  resultEl.innerHTML = `<h1>完了！</h1><p>タイム: ${duration} 秒</p><button onclick="restart()">もう一度</button>`;
  resultEl.style.display = "block";
}

function restart() {
  resultEl.style.display = "none";
  document.getElementById('intro').style.display = "block";
  startBtn.style.display = "inline-block";
}
