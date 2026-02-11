// Create player at (100, 100)
const player = new Player(100, 100);

// Log initial position
console.log("Initial Position:");
console.log("X:", player.getX(), "Y:", player.getY());

// Move player
player.move(25, -10);

// Log new position
console.log("After Move:");
console.log("X:", player.getX(), "Y:", player.getY());


/*
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SPAWN_Y_LIMIT = 60;
const PROBLEM_WIDTH = 140;
const H_PADDING = 10;
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
  player = new player(100, HEIGHT - 40);

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
  const MIN_SPAWN_TIME = 45 + (100 / (0.003 * frames + 1));
const maxSpawnTime =
  MIN_SPAWN_TIME + (100 + (1000 / (1 + frames)));

const timeSinceLast = frames - lastSpawnFrame;

if (timeSinceLast < MIN_SPAWN_TIME) {
  // too soon, do nothing
} else if (timeSinceLast >= maxSpawnTime) {
  spawnproblem();
  score++;
  lastSpawnFrame = frames;
} else {
  if (Math.random() < spawnRate) {
    spawnproblem();
    score++;
    lastSpawnFrame = frames;
  }
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

document.addEventListener("keydown", e => {
  if (e.key === "a" || e.key === "ArrowLeft") LeftKey = true;
  if (e.key === "d" || e.key === "ArrowRight") RightKey = true;

  if (GameState === 2 && e.key >= "0" && e.key <= "9") {
    shootDigit(Number(e.key));
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "a" || e.key === "ArrowLeft") LeftKey = false;
  if (e.key === "d" || e.key === "ArrowRight") RightKey = false;
});

function loadHighScores() {
  return JSON.parse(localStorage.getItem("highScores") || "[]");
}

function saveHighScores(scores) {
  localStorage.setItem("highScores", JSON.stringify(scores));
}
function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
function spawnproblem() {
  const blocked = [];

  // Build blocked regions
  for (const p of problems) {
    if (p.getY() < SPAWN_Y_LIMIT) {
      blocked.push({
        x: p.getX() - H_PADDING,
        y: 0,
        w: PROBLEM_WIDTH + H_PADDING * 2,
        h: 1
      });
    }
  }

  const freeXs = [];
  let x = 0;

  while (x + PROBLEM_WIDTH < WIDTH) {
    let free = true;

    for (const r of blocked) {
      if (
        x < r.x + r.w &&
        x + PROBLEM_WIDTH > r.x
      ) {
        free = false;
        x = r.x + r.w; // skip past blocked region
        break;
      }
    }

    if (free) {
      freeXs.push(x);
      x += PROBLEM_WIDTH;
    }
  }

  if (freeXs.length === 0) return;

  const spawnX = freeXs[Math.floor(Math.random() * freeXs.length)];
  problems.push(new problem(spawnX, 0));
}

window.onload = init;
*/

/*
const canvas = document.getElementById("game");
console.log("Canvas:", canvas);

const ctx = canvas.getContext("2d");
console.log("Context:", ctx);

// SAFE class existence check
console.log(
    "player class:", typeof window.player,
    "star class:", typeof window.star,
    "problem class:", typeof window.problem,
    "projectile class:", typeof window.projectile
);
__________________________________________________________
*/

