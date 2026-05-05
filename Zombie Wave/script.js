const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const pauseBtn = document.getElementById('pauseBtn');

// --- AUDIO ASSETS ---
const collectSound = new Audio('Collect Item Sound Effect.mp3');
const bgm = new Audio('Game BGM.mp3');
bgm.loop = true; 
bgm.volume = 0.5;

canvas.width = 900;
canvas.height = 600;

const cellSize = 100;
const cellGap = 5; 
let numberOfResources, frame, gameOver, gameStarted, isPaused, score;
let gameTime = 0; // NEW: Global timer variable
let defenders = [], enemies = [], projectiles = [], bonuses = [];
let draggingUnit = null;
const mouse = { x: 0, y: 0 };

const SPECIES = {
    STANDARD: { color: '#9b59b6', cost: 100, health: 100, power: 25, fireRate: 100, canAttack: true },
    FIRE: { color: '#e67e22', cost: 150, health: 80, power: 40, fireRate: 150, canAttack: true },
    ICE: { color: '#3498db', cost: 200, health: 160, power: 15, fireRate: 70, canAttack: true },
    SHIELD: { color: '#7f8c8d', cost: 50, health: 600, power: 0, fireRate: 0, canAttack: false },
    REMOVER: { color: '#000000', cost: 0, health: 0, power: 0, fireRate: 0, canAttack: false }
};

const ENEMY_TYPES = {
    STANDARD: { color: '#3d5a2d', health: 100, speedMult: 1, reward: 30 },
    BRUTE: { color: '#c0392b', health: 200, speedMult: 1, reward: 50 },
    TITAN: { color: '#000000', health: 500, speedMult: 0.5, reward: 100 }
};

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.color = color;
        this.opacity = 1;
    }
    update() {
        this.y -= this.speedY;
        this.opacity -= 0.015;
        if (this.size > 0.1) this.size -= 0.05;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- HELPER: TIME FORMATTER ---
function formatTime(frames) {
    let totalSeconds = Math.floor(frames / 60);
    let mins = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function resetGame() {
    bgm.currentTime = 0;
    bgm.play().catch(e => console.log("BGM waiting for interaction"));
    numberOfResources = 400; frame = 0; score = 0; gameTime = 0;
    gameOver = false; gameStarted = true; isPaused = false;
    defenders = []; enemies = []; projectiles = []; bonuses = [];
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    pauseBtn.innerText = "PAUSE";
}

document.getElementById('startBtn').addEventListener('click', resetGame);
document.getElementById('restartBtn').addEventListener('click', resetGame);

pauseBtn.addEventListener('click', () => {
    if (!gameStarted || gameOver) return;
    isPaused = !isPaused;
    if (isPaused) bgm.pause(); else bgm.play();
    pauseBtn.innerText = isPaused ? "RESUME" : "PAUSE";
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

document.querySelectorAll('.draggable-unit').forEach(unit => {
    unit.addEventListener('mousedown', (e) => {
        if (!gameStarted || isPaused || gameOver) return;
        const type = e.currentTarget.getAttribute('data-type');
        if (numberOfResources >= SPECIES[type].cost || type === 'REMOVER') {
            draggingUnit = { type: type };
        }
    });
});

window.addEventListener('mouseup', () => {
    if (draggingUnit && gameStarted && !isPaused) {
        const gridX = mouse.x - (mouse.x % cellSize);
        const gridY = mouse.y - (mouse.y % cellSize);
        
        if (mouse.y > cellSize) {
            const defenderIndex = defenders.findIndex(d => d.x === gridX && d.y === gridY);

            if (draggingUnit.type === 'REMOVER') {
                if (defenderIndex !== -1) {
                    enemies.forEach(e => {
                        if (Math.abs(e.x - defenders[defenderIndex].x) < 60 && e.y === defenders[defenderIndex].y) {
                            e.movement = e.speed;
                        }
                    });
                    defenders.splice(defenderIndex, 1);
                }
            } 
            else {
                const occupied = defenderIndex !== -1;
                if (!occupied && numberOfResources >= SPECIES[draggingUnit.type].cost) {
                    defenders.push(new Defender(gridX, gridY, draggingUnit.type));
                    numberOfResources -= SPECIES[draggingUnit.type].cost;
                }
            }
        }
    }
    draggingUnit = null;
});

class Bonus {
    constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = -50;
        this.speed = Math.random() * 1 + 1;
        this.radius = 20;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(241, 196, 15, 0.6)';
        let gradient = ctx.createRadialGradient(-5, -5, 2, 0, 0, this.radius);
        gradient.addColorStop(0, '#fffbe6');
        gradient.addColorStop(0.4, '#f1c40f');
        gradient.addColorStop(1, '#d35400');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
        this.drawStar(0, 0, 5, this.radius * 0.5, this.radius * 0.2);
        ctx.restore();
    }
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
    }
    update() { this.y += this.speed; }
}

class Enemy {
    constructor(y) {
        this.x = canvas.width; this.y = y;
        const rand = Math.random();
        if (rand < 0.1) this.type = 'TITAN';
        else if (rand < 0.3) this.type = 'BRUTE';
        else this.type = 'STANDARD';
        const stats = ENEMY_TYPES[this.type];
        this.health = stats.health; this.maxH = stats.health;
        this.color = stats.color; this.reward = stats.reward;
        this.speed = (Math.random() * 0.4 + 0.4) * stats.speedMult;
        this.movement = this.speed;
        this.speedModifier = 1;
        this.slowTimer = 0;
        this.burnTimer = 0;
    }
    draw() {
        if (this.slowTimer > 0) ctx.fillStyle = '#afeeee'; 
        else ctx.fillStyle = this.color;
        ctx.fillRect(this.x + cellGap, this.y + cellGap, cellSize - (cellGap * 2), cellSize - (cellGap * 2));
        
        if (this.burnTimer > 0) {
            ctx.strokeStyle = '#ff4500'; ctx.lineWidth = 3;
            ctx.strokeRect(this.x + cellGap, this.y + cellGap, cellSize - (cellGap * 2), cellSize - (cellGap * 2));
        }
        if (this.slowTimer > 0) {
            ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2;
            ctx.strokeRect(this.x + cellGap + 2, this.y + cellGap + 2, cellSize - (cellGap * 2) - 4, cellSize - (cellGap * 2) - 4);
        }
        ctx.fillStyle = this.type === 'TITAN' ? 'red' : 'yellow';
        ctx.fillRect(this.x + 20, this.y + 25, 10, 10); ctx.fillRect(this.x + 55, this.y + 25, 10, 10);
        ctx.fillStyle = '#c0392b'; ctx.fillRect(this.x + 15, this.y + 85, 70, 6);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(this.x + 15, this.y + 85, 70 * (this.health / this.maxH), 6);
    }
    update() { 
        if (this.slowTimer > 0) { this.slowTimer--; this.speedModifier = 0.4; } 
        else { this.speedModifier = 1; }
        if (this.burnTimer > 0) { this.burnTimer--; this.health -= 0.1; }
        this.x -= this.movement * this.speedModifier; 
    }
}

class Defender {
    constructor(x, y, type) {
        this.x = x; this.y = y; this.type = type;
        this.health = SPECIES[type].health; this.maxH = this.health;
        this.timer = 0;
        this.particles = [];
    }
    draw() {
        if (!isPaused) {
            if (this.type === 'FIRE') {
                for (let i = 0; i < 2; i++) {
                    this.particles.push(new Particle(this.x + cellGap + Math.random() * (cellSize - cellGap * 2), this.y + cellSize - cellGap, '#ff4500'));
                }
            } else if (this.type === 'ICE' && frame % 2 === 0) {
                this.particles.push(new Particle(this.x + cellGap + Math.random() * (cellSize - cellGap * 2), this.y + cellSize - cellGap, '#00ffff'));
            }
        }
        this.particles.forEach((p, index) => {
            p.update(); p.draw();
            if (p.opacity <= 0) this.particles.splice(index, 1);
        });
        ctx.fillStyle = SPECIES[this.type].color; 
        ctx.fillRect(this.x + cellGap, this.y + cellGap, cellSize - (cellGap * 2), cellSize - (cellGap * 2));
        if (this.type === 'SHIELD') {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(this.x + 15, this.y + 15, 10, 10); ctx.fillRect(this.x + 75, this.y + 15, 10, 10);
            ctx.fillRect(this.x + 15, this.y + 75, 10, 10); ctx.fillRect(this.x + 75, this.y + 75, 10, 10);
        }
        ctx.fillStyle = '#c0392b'; ctx.fillRect(this.x + 15, this.y + 10, 70, 5);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(this.x + 15, this.y + 10, 70 * (this.health / this.maxH), 5);
    }
    update() {
        if (SPECIES[this.type].canAttack && enemies.some(e => e.y === this.y && e.x > this.x)) {
            this.timer++;
            if (this.timer % SPECIES[this.type].fireRate === 0) {
                projectiles.push({ x: this.x + 75, y: this.y + 50, power: SPECIES[this.type].power, color: SPECIES[this.type].color, type: this.type });
            }
        }
    }
}

function handleGame() {
    if (frame % 250 === 0) enemies.push(new Enemy((Math.floor(Math.random() * 5) + 1) * cellSize));
    if (frame % 350 === 0) bonuses.push(new Bonus());

    defenders.forEach((d, i) => {
        d.draw(); d.update();
        enemies.forEach(e => { if (Math.abs(e.x - d.x) < 60 && e.y === d.y) { e.movement = 0; d.health -= 0.3; } });
        if (d.health <= 0) { 
            enemies.forEach(e => { if (Math.abs(e.x - d.x) < 60 && e.y === d.y) e.movement = e.speed; }); 
            defenders.splice(i, 1); 
        }
    });

    enemies.forEach((e, i) => {
        e.draw(); e.update();
        if (e.x < 0) { 
            gameOver = true; 
            bgm.pause(); 
            gameOverOverlay.classList.remove('hidden');
            document.getElementById('finalScore').innerHTML = `Score: ${score}<br>Survived: ${formatTime(gameTime)}`;
        }
        if (e.health <= 0) { score += 10; numberOfResources += e.reward; enemies.splice(i, 1); }
    });

    projectiles.forEach((p, i) => {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
        p.x += 5;
        enemies.forEach(e => { 
            if (p.x > e.x && p.x < e.x + 80 && p.y > e.y && p.y < e.y + 80) { 
                e.health -= p.power; 
                if (p.type === 'ICE') e.slowTimer = 150;
                if (p.type === 'FIRE') e.burnTimer = 180; 
                projectiles.splice(i, 1); 
            } 
        });
        if (p.x > canvas.width) projectiles.splice(i, 1);
    });

    bonuses.forEach((b, i) => {
        b.draw(); b.update();
        if (Math.hypot(mouse.x - b.x, mouse.y - b.y) < 30) { 
            collectSound.currentTime = 0; collectSound.play().catch(()=>{});
            numberOfResources += 50; bonuses.splice(i, 1); 
        }
        else if (b.y > canvas.height + 50) bonuses.splice(i, 1);
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    for (let x = 0; x <= canvas.width; x += cellSize) { ctx.beginPath(); ctx.moveTo(x, 100); ctx.lineTo(x, 600); ctx.stroke(); }
    for (let y = 100; y <= 600; y += cellSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke(); }
    
    ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, 0, canvas.width, 100);
    
    // UI Panel Text
    ctx.fillStyle = 'white'; ctx.font = 'bold 20px Arial';
    ctx.fillText(`Gold: $${numberOfResources}`, 20, 45); 
    ctx.fillText(`Score: ${score}`, 20, 80);
    
    // NEW: Draw Timer
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`Time: ${formatTime(gameTime)}`, canvas.width / 2 - 50, 60);

    if (gameStarted && !isPaused && !gameOver) { 
        handleGame(); 
        frame++; 
        gameTime++; // Increment survival timer
    }
    else { defenders.forEach(d => d.draw()); enemies.forEach(e => e.draw()); bonuses.forEach(b => b.draw()); }
    
    if (draggingUnit && !isPaused) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; 
        ctx.fillRect(mouse.x - (mouse.x % cellSize) + cellGap, mouse.y - (mouse.y % cellSize) + cellGap, cellSize - (cellGap*2), cellSize - (cellGap*2));
        ctx.globalAlpha = 0.6; ctx.fillStyle = SPECIES[draggingUnit.type].color; 
        if (draggingUnit.type === 'REMOVER') {
             ctx.strokeStyle = 'white'; ctx.lineWidth = 5; ctx.beginPath();
             ctx.moveTo(mouse.x - 20, mouse.y - 20); ctx.lineTo(mouse.x + 20, mouse.y + 20);
             ctx.moveTo(mouse.x + 20, mouse.y - 20); ctx.lineTo(mouse.x - 20, mouse.y + 20);
             ctx.stroke();
        } else {
             ctx.fillRect(mouse.x - 35, mouse.y - 35, 70, 70);
        }
        ctx.globalAlpha = 1.0;
    }
    requestAnimationFrame(animate);
}
animate();