//Global variables
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let leftKey = false;
let rightKey = false; 
let GameState = 0;//0 menu, 1 playing, 2 game over screen, 3 leaderboard
let gameOver = false;

// Set the canvas size
canvas.width = 800;   // desired width
canvas.height = 600;  // desired height
 
//projectile variables
let projectiles = []; // array to hold Projectile objects
let lastShotTime = 0;
const SHOOT_COOLDOWN_MS = 100; // 100ms cooldown between shots
//problem variables
let problems = [];
const PROBLEM_WIDTH = 160;
const SPAWN_Y_LIMIT = 150; // Y position to check for blocking
const H_PADDING = 1 // horizontal padding between problems
let lastSpawnTime = 0;
let frames = 0;
let score = 0;

let deltaTime = 0.016; // approx 60 FPS
let LastFrameTime = 0;
const frameInterval = 1000 / 60; // 60 FPS logic

//Stars
const STAR_COUNT = 100; // number of stars in the background
const stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new star(canvas.width, canvas.height));
}
//Toggle buttons
let bw = 40;
let bh = 30;
let startY = 100;
let startX=10;


const addBtn = new menuButton(startX, startY, bw, bh, "+", true);
const subBtn = new menuButton(startX, startY + 70, bw, bh, "-", true);
const mulBtn = new menuButton(startX, startY + 140, bw, bh, "x", true);
const divBtn = new menuButton(startX, startY + 210, bw, bh, "/", true);
const algBtn = new menuButton(startX, startY + 280, bw, bh, "x=?", true);
const TwoStepAlgBtn = new menuButton(startX, startY + 350, bw+20, bh, "2,x=?", true);
let MenuButtons = [addBtn, subBtn, mulBtn, divBtn, algBtn, TwoStepAlgBtn];

const TrainingModeBtn = new menuButton(canvas.width/2-((bw+150)/2), 50, bw+150, bh+10, "TRAINING MODE", false);



// play button variables
const playButton = {
    x: 0,
    y: 0,
    width: 220,
    height: 70
};
const backButton = {
    x: 10,
    y: 10,
    width: 80,
    height: 40
};
const leaderboardButton = {
    x: 0,
    y: 0,
    width: 220,
    height: 70
};
playAgainButton = {
    x: 0,
    y: 0,   
    width: 220,
    height: 70
}
//HighScore variables
let highScores = [];
let highScoreInitials = [];
let MAX_SCORES = 5;
let highScoreSaved = false;
let enteringInitials = false;
let playerInitials = "";
//Healt bar variables
let health = 100;
let maxHealth = 100;
let isLosingHealth = false;
let barWidth = canvas.width-40;
let whiteBarWidth = barWidth; 
let barHeight = 5;
let barX = canvas.width - barWidth - 20;
let barY = canvas.height - barHeight - 5;
//Sounds
// Setup
const soundManager = new SoundManager();
soundManager.load("Missed", "Missed.wav");
soundManager.load("Lazer", "Lazer.wav");
soundManager.load("CorrectSoundEffect", "CorrectSoundEffect.wav");



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


window.addEventListener("load", () => {
    console.log("Firebase available:", window.fb);
    console.log("window.fb:", window.fb);
    console.log("window.fb.query:", window.fb.query);
    /*const q = window.fb.query(
        window.fb.collection(window.db, "highscores"),
        window.fb.where("modeId", "==", modeId),
        window.fb.orderBy("score", "desc"),
        window.fb.limit(MAX_SCORES)
    );*/
    // safe to use window.fb here
});






// Game loop
function gameLoop(currentTime) {
   
    requestAnimationFrame(gameLoop);

        //console.log("Game loop running... Current time:", currentTime); // Debug statement to confirm game loop is running and check currentTime
        
        deltaTime = (currentTime - LastFrameTime) / 1000; // convert to seconds
        //console.log("Delta time for this frame:", deltaTime); // Debug statement to check deltaTime calculation
        LastFrameTime = currentTime;
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    

    for (let s of stars) {
        if (isNaN(deltaTime)) {deltaTime = 0.016;}
        
            
        s.update(canvas.width, canvas.height, deltaTime);
        
        s.draw(ctx);
    }
    
    if (GameState === 0) {
        //Menu
        
        drawStartScreen(ctx, canvas);
        
        return;

    }
    if (GameState === 2) {
        // Game over screen
        problems = [];
        
        drawGameOverScreen(ctx);
        
        return;
    }
    if (GameState === 3) {
        drawLeaderboardScreen(ctx);
       
        return;
    }
    if(GameState === 4) {
        drawSaveScoreScreen(ctx);
        
        return;
    }
    
    drawScore(ctx);
    drawHealthBar(ctx);
    // Update player position
    if (leftKey){p.move(-8* deltaTime * 60, 0); } 
    if (rightKey){p.move(8* deltaTime * 60, 0); } 

   

    
        frames++;

        for (let p of projectiles) {
        p.update();
        p.draw(ctx);
        }
        for (let p of problems) {
            let trainingMode = TrainingModeBtn.isEnabled();
            if(trainingMode){
                p.update(deltaTime/2);
                console.log("Training mode: Slowing down problems for better learning...");
            }else{
                p.update(deltaTime);
            }
            
        //console.log(`Drawing problem at (${p.x}, ${p.y}): ${p.problemText}`);
        p.draw(ctx);
        }
       
        
        
    
    


    trySpawnProblem();
    

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

                    soundManager.play("CorrectSoundEffect");

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
    // Check problems from bottom up
    for (let i = problems.length - 1; i >= 0; i--) {

        let prob = problems[i];

        if (prob.y > canvas.height && !prob.isSolved()) {

            health -= 10;
            soundManager.play("Missed");
            isLosingHealth = true;
            problems.splice(i, 1); // remove problem

            
        }
    }

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

    if (intersects && !prob.isCorrect) {
        gameOver = true;
        
        console.log("Game Over! Final Score: " + score);

        GameState = 2;
        loadHighScores();
        let result = false;
        console.log("Can HighScores Be saved: "+!TrainingModeBtn.isEnabled());
        let TrainingModeStatus = !TrainingModeBtn.isEnabled();
        qualifies(score).then(result => {
        console.log("qualifies(score):", result);
        
        if (result && !highScoreSaved && TrainingModeStatus) {
            GameState = 4;
            enteringInitials = true;
        }else{GameState = 2;}
        });

        //console.log("Game Over! Final Score: " + score);
        //console.log("qualifies(score): " + result);

        //console.log("highScoreSaved: " + highScoreSaved+" Im taking opposite of this for testing so "+ !highScoreSaved);

        //console.log(result && !highScoreSaved);
        
        
        break;
        
    }
}
for (let prob of problems) {
    for (let prob2 of problems) {
        const probBounds = prob.getBounds();
        const prob2Bounds = prob2.getBounds();
        const intersects = !(
        probBounds.x + probBounds.width < prob2Bounds.x ||
        probBounds.x > prob2Bounds.x + prob2Bounds.width ||
        probBounds.y + probBounds.height < prob2Bounds.y ||
        probBounds.y > prob2Bounds.y + prob2Bounds.height
    );
        if (intersects) {
            if(prob.speed>prob2.speed) {
                prob.speed = prob2.speed;
            }else{
                prob2.speed = prob.speed;
            }
        }

    }
}


    if(health <= 0) {
        gameOver = true;
        GameState = 2;
        loadHighScores();
        let result = false;
        let TrainingModeStatus = !TrainingModeBtn.isEnabled();
        qualifies(score).then(result => {
        console.log("qualifies(score):", result);
        if (result && !highScoreSaved && TrainingModeStatus) {
            GameState = 4;
            enteringInitials = true;
        }else{GameState = 2;}
        });

        //console.log("Game Over! Final Score: " + score);
        //console.log("qualifies(score): " + result);

        //console.log("highScoreSaved: " + highScoreSaved+" Im taking opposite of this for testing so "+ !highScoreSaved);

        //console.log(result && !highScoreSaved);
        
    }

    // Draw player
    p.draw(ctx);

    // Next frame
    
}




function addScore(s) { score += s; }


function drawHealthBar(ctx) {
    // Calculate health width
let healthWidth = barWidth * (health / maxHealth);



// White "incoming damage" animation
if (isLosingHealth) {

    
    if (whiteBarWidth > healthWidth) { 
        whiteBarWidth -= 1; // decrease white bar width to create shrinking effect
    }else{
        isLosingHealth = false;
        whiteBarWidth = healthWidth; // reset for next time
    }

    
    ctx.fillStyle = "white";
    ctx.fillRect(
        barX,
        barY,
        whiteBarWidth,
        barHeight
    );
}
// Draw red health portion
ctx.fillStyle = "red";
ctx.fillRect(barX, barY, healthWidth, barHeight);

}


function drawScore(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

function drawStartScreen(ctx, canvas) {
    // Draw the title
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    const title = "MATH GAME";
    const titleWidth = ctx.measureText(title).width;
    const titleX = (canvas.width - titleWidth) / 2;
    ctx.fillText(title, titleX, 180);

    // Position the play button dynamically
    playButton.x = (canvas.width - playButton.width) / 2;
    playButton.y = 260;

    // Draw the play button
    ctx.fillStyle = "red";
    ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(playButton.x, playButton.y, playButton.width, playButton.height);
    // Center horizontally
    leaderboardButton.x = (ctx.canvas.width - leaderboardButton.width) / 2;
    leaderboardButton.y = 350;

    // Draw button background
    ctx.fillStyle = "red";
    ctx.fillRect(
    leaderboardButton.x,
    leaderboardButton.y,
    leaderboardButton.width,
    leaderboardButton.height
);
ctx.fillRect(leaderboardButton.x, leaderboardButton.y, leaderboardButton.width, leaderboardButton.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(leaderboardButton.x, leaderboardButton.y, leaderboardButton.width, leaderboardButton.height);

// Draw button text
ctx.fillStyle = "white";
ctx.font = "bold 28px Arial";
drawCenteredString(ctx, "LEADERBOARD", leaderboardButton);

    // Draw the "PLAY" text centered inside the button
    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";
    drawCenteredString(ctx, "PLAY", playButton);
    addBtn.draw(ctx);
    subBtn.draw(ctx);
    mulBtn.draw(ctx);
    divBtn.draw(ctx);
    algBtn.draw(ctx);
    TwoStepAlgBtn.draw(ctx);

    TrainingModeBtn.draw(ctx);

}

function drawGameOverScreen(ctx) {
    
    
    drawBackButton(ctx);
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // ===== GAME OVER text =====
    ctx.fillStyle = "red";
    ctx.font = "bold 48px Arial";

    const msg = "GAME OVER";
    const msgWidth = ctx.measureText(msg).width;
    const msgX = (canvasWidth - msgWidth) / 2;
    const msgY = canvasHeight / 2;

    ctx.fillText(msg, msgX, msgY);

    // ===== Final Score =====
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";

    const finalScore = "Final Score: " + score;
    const scoreWidth = ctx.measureText(finalScore).width;
    const scoreX = (canvasWidth - scoreWidth) / 2;

    ctx.fillText(finalScore, scoreX, msgY + 60);

    // ===== PLAY AGAIN button =====
    playAgainButton.x = (canvasWidth - playAgainButton.width) / 2;
    playAgainButton.y = msgY + 120;

    ctx.fillStyle = "red";
    ctx.fillRect(playAgainButton.x, playAgainButton.y, playAgainButton.width, playAgainButton.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";
    drawCenteredString(ctx, "PLAY AGAIN", playAgainButton);

    // ===== LEADERBOARD button =====
    leaderboardButton.x = (canvasWidth - leaderboardButton.width) / 2;
    leaderboardButton.y = msgY + 210;

    ctx.fillStyle = "red";
    ctx.fillRect(
        leaderboardButton.x,
        leaderboardButton.y,
        leaderboardButton.width,
        leaderboardButton.height
    );

    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    drawCenteredString(ctx, "LEADERBOARD", leaderboardButton);
}




function drawLeaderboardScreen(ctx) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    loadHighScores(); // Ensure we have the latest scores before drawing
    // ===== Background title =====
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";

    const titleRect = {
        x: 0,
        y: 40,
        width: canvasWidth,
        height: 60
    };

    drawCenteredString(ctx, "LEADERBOARD", titleRect);

    // ===== Draw Back Button =====
    drawBackButton(ctx);

    // ===== Draw Scores =====
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "white";

    let startY = 140;      // where scores begin
    let spacing = 50;      // space between rows

    for (let i = 0; i < highScores.length; i++) {

        const rank = i + 1;
        const initials = highScoreInitials[i];
        const score = highScores[i];

        const line = `${rank}.  ${initials}   .....   ${score}`;

        const rowRect = {
            x: 0,
            y: startY + (i * spacing),
            width: canvasWidth,
            height: 40
        };

        drawCenteredString(ctx, line, rowRect);
    }

    // ===== If no scores =====
    if (highScores.length === 0) {
        const emptyRect = {
            x: 0,
            y: canvasHeight / 2,
            width: canvasWidth,
            height: 40
        };

        drawCenteredString(ctx, "NO SCORES YET", emptyRect);
    }
}


function drawBackButton(ctx) {
    backButton.x = 20;
    backButton.y = 20;

    // Background
    ctx.fillStyle = "red";
    ctx.fillRect(
        backButton.x,
        backButton.y,
        backButton.width,
        backButton.height
    );

    // Border
    ctx.strokeStyle = "white";
    ctx.strokeRect(
        backButton.x,
        backButton.y,
        backButton.width,
        backButton.height
    );

    // Text
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    drawCenteredString(ctx, "BACK", backButton);
}

function drawSaveScoreScreen(ctx) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Title
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    drawCenteredString(ctx, "NEW HIGH SCORE!", {
        x: 0,
        y: 40,
        width: canvasWidth,
        height: 60
    });

    // Instructions
    ctx.font = "bold 24px Arial";
    drawCenteredString(ctx, "Enter your initials:", {
        x: 0,
        y: 120,
        width: canvasWidth,
        height: 30
    });

        ctx.fillStyle = "yellow";
    ctx.font = "bold 36px Arial";

    const rect = {
        x: 0,
        y: ctx.canvas.height / 2 + 120,
        width: ctx.canvas.width,
        height: 60
    };

    drawCenteredString(ctx, "ENTER INITIALS: " + playerInitials, rect);
}

// Utility to draw text centered in a rectangle (fixed)
function drawCenteredString(ctx, text, rect) {
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    // Use actualBoundingBoxAscent for better vertical alignment if supported
    const textHeight = metrics.actualBoundingBoxAscent || 24; // fallback if unsupported
    const textX = rect.x + (rect.width - textWidth) / 2;
    const textY = rect.y + (rect.height + textHeight) / 2;

    ctx.fillText(text, textX, textY);
}




// ======================
// Shoot projectile
// ======================   
function shootDigit(digit) {
    const currentTime = Date.now(); // JS equivalent of System.currentTimeMillis()
    if (currentTime - lastShotTime < SHOOT_COOLDOWN_MS) return;

    //Sound effect for shooting (not implemented yet, but can add it here)
    soundManager.play("Lazer");

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
    //console.log("trying to spawn problem... Frames since last spawn: " + (now - lastSpawnTime));
    // Calculate spawn rate and timing
    const spawnRate = 0.001 + 0.0000015 * frames;
    let MIN_SPAWN_TIME = 50 + 1 / (0.0006 * frames + 1);
    let trainingMode = TrainingModeBtn.isEnabled();
    if (trainingMode) {
        console.log("Training Mode Enabled, adjusting spawn times...");
        MIN_SPAWN_TIME += 50; // Double the minimum spawn time for training mode
        
    }else{
        console.log("Training Mode Disabled, normal spawn times...");
    }

    const maxSpawnTime = MIN_SPAWN_TIME + (100 + 1000 / (1 + frames));
    const timeSinceLast = now - lastSpawnTime;
    //console.log(now);

    if (timeSinceLast < MIN_SPAWN_TIME) {
        // Too soon, do nothing
        return;
    } else if (timeSinceLast >= maxSpawnTime) {
        // Max time exceeded → force spawn
        spawnProblem();
        score++;
        lastSpawnTime = now;
        //console.log("Spawned at max");
    } else {
        // Random chance to spawn
        if (Math.random() < spawnRate) {
            spawnProblem();
            score++;
            lastSpawnTime = now;
            //console.log("Spawned in between min and max");
        }
    }
}

function spawnProblem() {

    // Create the problem first so we know its true width
    

    const blocked = [];

    // Build blocked ranges using each problem's REAL width
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

    // Use realWidth instead of PROBLEM_WIDTH
    while (x + PROBLEM_WIDTH <= canvas.width) {

        let free = true;

        for (let r of blocked) {
            if (x < r.x + r.width && x + PROBLEM_WIDTH > r.x) {
                free = false;
                x = r.x + r.width;
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

    if (GameState === 4 && enteringInitials) {
        if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            playerInitials += e.key.toUpperCase();
        } else if (e.key === "Backspace") {
            playerInitials = playerInitials.slice(0, -1);
        } else if (e.key === "Enter") {
            saveHighScores(playerInitials);
            enteringInitials = false;
            GameState = 0;
        }
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
canvas.addEventListener("mousedown", (e) => {
    // Only respond if we're on the start screen or game over screen
    if (GameState === 0 || GameState === 2 || GameState === 3) {
        // Get mouse position relative to canvas
        
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (
            mx >= backButton.x &&
            mx <= backButton.x + backButton.width &&
            my >= backButton.y &&
            my <= backButton.y + backButton.height
        ) {
            
            GameState = 0;
            return;
        }
        if (
            mx >= leaderboardButton.x &&
            mx <= leaderboardButton.x + leaderboardButton.width &&
            my >= leaderboardButton.y &&
            my <= leaderboardButton.y + leaderboardButton.height
        ) {
            
            GameState = 3;
            return;
        }
        if (addBtn.contains(mx, my)) {
        addBtn.toggle();
        problem.setAllowAddition(addBtn.isEnabled());
        }

        if (subBtn.contains(mx, my)) {
            subBtn.toggle();
            problem.setAllowSubtraction(subBtn.isEnabled());
        }

        if (mulBtn.contains(mx, my)) {
            mulBtn.toggle();
            problem.setAllowMultiplication(mulBtn.isEnabled());
        }

        if (divBtn.contains(mx, my)) {
            divBtn.toggle();
            problem.setAllowDivision(divBtn.isEnabled());
        }

        if (algBtn.contains(mx, my)) {
            algBtn.toggle();
            problem.setAllowAlgebra(algBtn.isEnabled());
        }
        if (TwoStepAlgBtn.contains(mx, my)) {
            TwoStepAlgBtn.toggle();
            problem.setAllowAlgebraTwoStep(TwoStepAlgBtn.isEnabled());
        }
        if (TrainingModeBtn.contains(mx, my)) {
            TrainingModeBtn.toggle();
            
        }
        
        // Check if Play button was clicked
        if (
            mx >= playButton.x &&
            mx <= playButton.x + playButton.width &&
            my >= playButton.y &&
            my <= playButton.y + playButton.height
        ) {
            // Start the game
            GameState = 1;
            highScoreSaved = false;
            gameOver = false;
            health = maxHealth;
            score = 0;
            frames = 0;
            timeSinceLast = 0;
            lastSpawnTime=0;
            now = 0;
            problems = [];
            projectiles = [];
            spawnProblem();
        }
        if (
            mx >= playAgainButton.x &&
            mx <= playAgainButton.x + playAgainButton.width &&
            my >= playAgainButton.y &&
            my <= playAgainButton.y + playAgainButton.height
        ) {
            // Start the game
            GameState = 1;
            highScoreSaved = false;
            gameOver = false;
            health = maxHealth;
            score = 0;
            frames = 0;
            timeSinceLast = 0;
            lastSpawnTime=0;
            now = 0;
            problems = [];
            projectiles = [];
            spawnProblem();
        }
    }
    
});


async function loadHighScores() {

    const modeId = getModeId();
    //console.log("Loading high scores for mode:", modeId);

    const q = window.fb.query(
        window.fb.collection(window.db, "highscores"),
        window.fb.where("modeId", "==", modeId),
        window.fb.orderBy("score", "desc"),
        window.fb.limit(MAX_SCORES)
    );
    

    const snapshot = await window.fb.getDocs(q);

    highScores = [];
    highScoreInitials = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        highScores.push(data.score);
        highScoreInitials.push(data.initials);
    });
}

async function saveHighScores(initials) {

    const modeId = getModeId();

    await window.fb.addDoc(
        window.fb.collection(window.db, "highscores"),
        {
            initials: initials,
            score: score,
            modeId: modeId,
            timestamp: Date.now()
        }
    );
}

async function qualifies(newScore) {

    await loadHighScores();

    if (highScores.length < MAX_SCORES) {
        return true;
    }

    let minScore = Math.min(...highScores);
    console.log("Minimum score to beat:", minScore);
    return newScore > minScore;
}


async function testFirebase() {
    try {
        await window.fb.addDoc(
            window.fb.collection(window.db, "test"),
            { message: "Connection works!", time: Date.now() }
        );
        //console.log("🔥 Firebase write successful");
    } catch (e) {
        console.error("Firebase error:", e);
    }
}
async function initLeaderboard() {
    await loadHighScores();
    
}

function getModeId() {
    
    return MenuButtons
        .map(button => button.isEnabled() ? "1" : "0")
        .join("");

}
