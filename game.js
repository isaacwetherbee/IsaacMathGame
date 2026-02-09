const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make background visible
ctx.fillStyle = "blue";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Big obvious text
ctx.fillStyle = "white";
ctx.font = "40px Arial";
ctx.fillText("GAME IS RUNNING", 200, 300);

console.log("Game JS loaded");
