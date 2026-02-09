const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 40,
  width: 50,
  height: 20,
  speed: 6
};

// Game state
let score = 0;
let health = 100;
const maxHealth = 100;

// Math problem
let problem = null;

function newProblem() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  problem = {
    text: `${a} + ${b}`,
    answer: a + b,
    x: Math.random() * (canvas.width - 60),
    y: 0,
    speed: 2
  };
}

newProblem();

// Input
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Game loop
function update() {
  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] && player.x + player.width < canvas.width) {
    player.x += player.speed;
  }

  problem.y += problem.speed;

  // Missed problem
  if (problem.y > canvas.height) {
    health -= 10;
    newProblem();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Problem
  ctx.fillStyle = "yellow";
  ctx.font = "20px Arial";
  ctx.fillText(problem.text, problem.x, problem.y);

  // Score
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 25);

  // Health bar
  ctx.fillStyle = "darkred";
  ctx.fillRect(50, canvas.height - 10, canvas.width - 100, 5);

  ctx.fillStyle = "red";
  const healthWidth = (canvas.width - 100) * (health / maxHealth);
  ctx.fillRect(50, canvas.height - 10, healthWidth, 5);
}

function loop() {
  if (health <= 0) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", 260, 300);
    ctx.font = "20px Arial";
    ctx.fillText("Final Score: " + score, 320, 340);
    return;
  }

  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
