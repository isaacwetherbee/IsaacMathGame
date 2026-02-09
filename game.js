const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let x = 375;

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(x, 560, 50, 20);

  x += 2;
  if (x > canvas.width) x = -50;

  requestAnimationFrame(gameLoop);
}

gameLoop();

