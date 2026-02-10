const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ======================
// Game state
// ======================
let GameState = 1; // 1=start, 2=playing, 3=game over, 4=leaderboard, 5=initials

let player;
let projectiles = [];
let problems = [];
let stars = [];

let LeftKey = false;
let RightKey = false;
let direction = 0;

let score = 0;
let health = 100;
const maxHealth = 100;

let frames = 0;
let lastSpawnFrame = 0;

let lastShotTime = 0;
const SHOOT_COOLDOWN_MS = 100;

let lastTime = performance.now();

// ======================
// Init
// ======================
function init() {
  player = new Player(100, HEIGHT - 40);

  for (let i = 0; i < 50; i++) {
    stars.push(new Star(WIDTH, HEIGHT));
  }

  requestAnimationFrame(loop);
}

// ======================
// Main loop
// ======================
function loop(time) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  update(deltaTime);
  draw();

  requestAnimationFrame(loop);
}

// ======================
// Update
// ======================
function update(dt) {
  frames++;

  stars.forEach(s => s.update(HEIGHT));

  if (GameState !== 2) return;

  // -------- Movement --------
  const speed = 10;
  if (RightKey) direction = 1;
  if (LeftKey) direction = -1;
  if (!LeftKey && !RightKey) direction = 0;

  const dx = speed * direction * dt * 60;
  const nextLeft = player.x - player.size / 2 + dx;
  const nextRight = player.x + player.size / 2 + dx;

  if (nextLeft > 0 && nextRight < WIDTH) {
    player.move(dx, 0);
  }

  // -------- Spawn problems --------
  const MIN_SPAWN_TIME = 50 + (100 / (0.0003 * frames + 1));
  const maxSpawnTime = MIN_SPAWN_TIME + (100 + (1000 / (1 + frames)));

  const timeSinceLast = frames - lastSpawnFrame;
  const spawnRate = 0.01 + 0.00015 * frames;

  if (timeSinceLast >= maxSpawnTime || (timeSinceLast >= MIN_SPAWN_TIME && Math.random() < spawnRate)) {
    spawnProblem();
    score++;
    lastSpawnFrame = frames;
  }

  // -------- Update objects --------
  problems.forEach(p => p.update(dt));
  projectiles.forEach(p => p.update());

  projectiles = projectiles.filter(p => !p.isOffScreen(WIDTH, HEIGHT));

  // -------- Collisions --------
  projectiles = projectiles.filter(proj => {
    for (let prob of problems) {
      if (rectsIntersect(proj.getBounds(), prob.getBounds())) {
        if (!prob.isCorrect && prob.acceptDigitAnywhere(proj.digit)) {
          if (prob.isSolved()) {
            score += 10;
            prob.isCorrect = true;
            prob.blinkFrames = 0;
          }
        }
        return false;
      }
    }
    return true;
  });

  // -------- Lose health --------
  problems = problems.filter(p => {
    if (p.y > HEIGHT) {
      health -= 10;
      return false;
    }
    return true;
  });

  if (health <= 0) {
    GameState = 3;
  }
}

// ======================
// Draw
// ======================
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  stars.forEach(s => s.draw(ctx));

  if (GameState === 1) drawStartScreen();
  if (GameState === 2) drawGameScreen();
  if (GameState === 3) drawGameOverScreen();
}

// ======================
// Screens
// ======================
function drawGameScreen() {
  ctx.fillStyle = "orange";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, WIDTH - 150, 30);

  // Health bar
  ctx.fillStyle = "#333";
  ctx.fillRect(50, HEIGHT - 5, WIDTH - 100, 5);

  ctx.fillStyle = "red";
  ctx.fillRect(50, HEIGHT - 5, (WIDTH - 100) * (health / maxHealth), 5);

  player.draw(ctx);
  projectiles.forEach(p => p.draw(ctx));
  problems.forEach(p => p.draw(ctx));
}
