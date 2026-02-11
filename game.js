//Global variables
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let leftKey = false;
let rightKey = false;
let GameState = 0;

// Set the canvas size
canvas.width = 800;   // desired width
canvas.height = 600;  // desired height

//projectile variables
let projectiles = []; // array to hold Projectile objects
let lastShotTime = 0;
const SHOOT_COOLDOWN_MS = 100; // 100ms cooldown between shots
//problem variables
let problems = [];
const PROBLEM_WIDTH = 80;
const SPAWN_Y_LIMIT = 150; // Y position to check for blocking
const H_PADDING = 10; // horizontal padding between problems
lastSpawnTime = 0;
let frames = 0;
let score = 0;
let deltaTime = 0.016; // approx 60 FPS

//Testing player class
console.log("Hello, World! Welcome to Isaac's Math Game!");

const p = new player(100, 100);

p.position = { x: 150, y: canvas.height - p.getSize() - 20 }; // Start near the bottom of the canvas

console.log("Player position: (" + p.getX() + ", " + p.getY() + ")");

p.move(10, 15);

console.log("Player position after moving: (" + p.getX() + ", " + p.getY() + ")");

gameLoop();

console.log('projectile class exists:', typeof projectile);


//shootDigit(5); // Test shooting a digit projectile

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update player position
    if (leftKey){p.move(-5, 0);console.log("Left key pressed, moving left..."); } 
    if (rightKey){p.move(5, 0);console.log("Right key pressed, moving right..."); } 

    for (let p of projectiles) {
    p.update();
    p.draw(ctx);
    }
    frames++;
    trySpawnProblem();
    for (let p of problems) {
    p.update(0.009);
    //console.log(`Drawing problem at (${p.x}, ${p.y}): ${p.problemText}`);
    p.draw(ctx);
    }

    projectiles = projectiles.filter(proj => {
    // Check collision against all problems
    for (let prob of problems) {
        const projBounds = proj.getBounds();
        const probBounds = prob.getBounds();

        // Check intersection
        const intersects = !(
        projBounds.x + projBounds.width < probBounds.x ||
        projBounds.x > probBounds.x + probBounds.width ||
        projBounds.y + projBounds.height < probBounds.y ||
        projBounds.y > probBounds.y + probBounds.height
        );


        if (intersects) {
            // Handle correct digit entry
            if (!prob.isCorrect && prob.acceptDigitAnywhere(proj.getDigit())) {
                if (prob.isSolved()) {
                    addScore(10);
                    //if (CorrectSoundEffect) CorrectSoundEffect.play();

                    // Start blink animation
                    prob.isCorrect = true;
                    prob.blinkFrames = 0;
                }
            }

            // Projectile disappears after collision
            return false; 
        }
    }

    // Keep projectile if no collision
    return true;
    });
    problems = problems.filter(p => {
    // Update problem position
    

    if (p.isCorrect) {
        p.blinkFrames++;

        // Remove if blink animation finished
        if (p.blinkFrames >= problem.BLINK_DURATION) {
            return false; // remove this problem
        }

        return true; // keep problem until blink finishes
    }

    return true; // keep problems that aren't correct
    });
    for (let prob of problems) {
    const probBounds = prob.getBounds();
    const playerBounds = p.getBounds();

    // Rectangle intersection check
    const intersects = !(
        probBounds.x + probBounds.width < playerBounds.x ||
        probBounds.x > playerBounds.x + playerBounds.width ||
        probBounds.y + probBounds.height < playerBounds.y ||
        probBounds.y > playerBounds.y + playerBounds.height
    );

    if (intersects && !p.isCorrect) {
        gameOver = true;
        GameState = 3;
        console.log("Game Over! Final Score: " + score);
        break;
        
    }
}



    // Draw player
    p.draw(ctx);

    // Next frame
    requestAnimationFrame(gameLoop);
}




function addScore(s) { score += s; }

// ======================
// Shoot projectile
// ======================   
function shootDigit(digit) {
    const currentTime = Date.now(); // JS equivalent of System.currentTimeMillis()
    if (currentTime - lastShotTime < SHOOT_COOLDOWN_MS) return;

    //Sound effect for shooting (not implemented yet, but can add it here)
    //if (Lazer) Lazer.play();

    lastShotTime = currentTime;

    const tipX = p.position.x;           // player's x
    const tipY = p.position.y - p.size/2; // tip of the triangle
 
    // Create new projectile and add to array
    const proj = new projectile(tipX, tipY, 0, -1, digit);
    projectiles.push(proj);
}
// ======================
// Problem spawning
// ======================
function trySpawnProblem() {
    const now = frames;

    // Calculate spawn rate and timing
    const spawnRate = 0.001 + 0.000015 * frames;
    const MIN_SPAWN_TIME = 100 + 100 / (0.003 * frames + 1);
    const maxSpawnTime = MIN_SPAWN_TIME + (100 + 1000 / (1 + frames));
    const timeSinceLast = now - lastSpawnTime;

    if (timeSinceLast < MIN_SPAWN_TIME) {
        // Too soon, do nothing
        return;
    } else if (timeSinceLast >= maxSpawnTime) {
        // Max time exceeded → force spawn
        spawnProblem();
        score++;
        lastSpawnTime = now;
        console.log("Spawned at max");
    } else {
        // Random chance to spawn
        if (Math.random() < spawnRate) {
            spawnProblem();
            score++;
            lastSpawnTime = now;
            console.log("Spawned in between min and max");
        }
    }
}

function spawnProblem() {
    const blocked = [];

    // Build blocked x-ranges based on problems near the spawn limit
    for (let p of problems) {
        if (p.y < SPAWN_Y_LIMIT) {
            blocked.push({
                x: p.x - H_PADDING,
                width: PROBLEM_WIDTH + H_PADDING * 2
            });
        }
    }

    const freeXs = [];
    let x = 0;

    while (x + PROBLEM_WIDTH < canvas.width) {
        let free = true;

        for (let r of blocked) {
            if (x < r.x + r.width && x + PROBLEM_WIDTH > r.x) {
                free = false;
                x = r.x + r.width; // skip past this blocked area
                break;
            }
        }

        if (free) {
            freeXs.push(x);
            x += PROBLEM_WIDTH; // move to next potential slot
        }
    }

    if (freeXs.length === 0) return; // no free space

    // Pick a random free x-position
    const spawnX = freeXs[Math.floor(Math.random() * freeXs.length)];

    // Spawn new problem at the top
    problems.push(new problem(spawnX, 0));
}



// Key press handling is now moved to the end of the file for better organization and to ensure all classes are defined before they are used.
window.addEventListener('keydown', (e) => {
    //console.log("Key pressed:", e.code); // Debug statement to check which key is pressed
    

    switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            leftKey = true;
            //console.log("Left key pressed, setting leftKey to true..."); // Debug statement to confirm leftKey is set
            break;
        case 'ArrowRight':
        case 'KeyD':
            rightKey = true;
            //console.log("Right key pressed, setting rightKey to true..."); // Debug statement to confirm rightKey is set
            break;
    }
    // Top row numbers (0-9)
    if (e.code.startsWith('Digit')) {
        const digit = parseInt(e.code.slice(5)); // 'Digit0' -> 0
        shootDigit(digit);
    }

    // Numpad numbers (0-9)
    if (e.code.startsWith('Numpad')) {
        const digit = parseInt(e.code.slice(6)); // 'Numpad0' -> 0
        shootDigit(digit);
    }
});
//Key release handling
window.addEventListener('keyup', (e) => {
    //console.log("Key pressed:", e.code); // Debug statement to check which key is released
    switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            leftKey = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            rightKey = false;
            break;
    }
});
