// ============================================
// Aami & the Flying Hen — Main Game Engine
// ============================================

// Adventure mode stage definitions
const STAGES = [
    { name: 'Village Backyard', obstacles: 10, theme: 'village', emoji: '🏡' },
    { name: 'Forest Trail', obstacles: 15, theme: 'forest', emoji: '🌲' },
    { name: 'Mountain Chase', obstacles: 20, theme: 'mountain', emoji: '🏔️' },
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Logical size
        this.canvas.width = GAME.WIDTH;
        this.canvas.height = GAME.HEIGHT;

        // Systems
        this.player = new Player();
        this.background = new Background();
        this.obstacleManager = new ObstacleManager();
        this.collectibleManager = new CollectibleManager();
        this.particles = new ParticleSystem();
        this.audio = new AudioManager();
        this.ui = new UI();

        // State: MENU, MODE_SELECT, PLAYING, STAGE_COMPLETE, GAME_OVER
        this.state = 'MENU';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('aami_highscore')) || 0;
        this.isNewHighScore = false;
        this.scrollSpeed = PHYSICS.SCROLL_SPEED;
        this.gameStartTime = 0;
        this.lastObstacleCount = 0;

        // Mode system
        this.gameMode = 'endless'; // 'endless' or 'adventure'
        this.currentStage = 0;
        this.obstaclesPassed = 0;
        this.stageTarget = 0;
        this.stageCompleteDelay = 0;
        this.endlessThemeIndex = 0;
        this.endlessThemeCycle = 15; // change theme every N obstacles

        // Timing
        this.lastTime = 0;
        this.dt = 0;
        this.gameOverDelay = 0;

        // Input
        this.setupInput();

        // Resize
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start loop
        requestAnimationFrame((t) => this.loop(t));
    }

    setupInput() {
        // Click / tap
        this.canvas.addEventListener('click', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput(e);
        }, { passive: false });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput(e);
            }
            if (e.code === 'KeyM') {
                this.audio.toggleMute();
            }
        });

        // Click position detection (for buttons)
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = GAME.WIDTH / rect.width;
            const scaleY = GAME.HEIGHT / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            // Check sound button
            if (distance(mx, my, GAME.WIDTH - 30, GAME.HEIGHT - 30) < 20) {
                this.audio.toggleMute();
            }

            // Mode select buttons
            if (this.state === 'MODE_SELECT') {
                this.handleModeSelectClick(mx, my);
            }

            // Stage complete — next stage or menu
            if (this.state === 'STAGE_COMPLETE' && this.stageCompleteDelay > 500) {
                this.handleStageCompleteClick(mx, my);
            }
        });
    }

    handleInput(e) {
        // Initialize audio on first interaction
        if (!this.audio.initialized) {
            this.audio.init();
        }

        switch (this.state) {
            case 'MENU':
                this.state = 'MODE_SELECT';
                break;
            case 'MODE_SELECT':
                // Handled by click position detection
                break;
            case 'GET_READY':
                this.state = 'PLAYING';
                this.gameStartTime = performance.now();
                this.player.flap();
                this.audio.playFlap();
                break;
            case 'PLAYING':
                this.player.flap();
                this.audio.playFlap();
                this.particles.emitFeathers(this.player.x - 10, this.player.y + 5, 2);
                break;
            case 'STAGE_COMPLETE':
                // Handled by click position detection
                break;
            case 'GAME_OVER':
                if (this.gameOverDelay > 500) {
                    this.resetGame();
                }
                break;
        }
    }

    handleModeSelectClick(mx, my) {
        const centerX = GAME.WIDTH / 2;
        // Endless button
        const btn1X = centerX - 230;
        const btn1Y = 280;
        const btnW = 200;
        const btnH = 180;
        if (mx >= btn1X && mx <= btn1X + btnW && my >= btn1Y && my <= btn1Y + btnH) {
            this.gameMode = 'endless';
            this.startGame();
            return;
        }
        // Adventure button
        const btn2X = centerX + 30;
        const btn2Y = 280;
        if (mx >= btn2X && mx <= btn2X + btnW && my >= btn2Y && my <= btn2Y + btnH) {
            this.gameMode = 'adventure';
            this.currentStage = 0;
            this.startGame();
            return;
        }
    }

    handleStageCompleteClick(mx, my) {
        const centerX = GAME.WIDTH / 2;
        // Next Stage button
        if (this.currentStage < STAGES.length - 1) {
            const nBtnX = centerX - 105;
            const nBtnY = 370;
            if (mx >= nBtnX && mx <= nBtnX + 210 && my >= nBtnY && my <= nBtnY + 50) {
                this.currentStage++;
                this.startGame();
                return;
            }
        }
        // Menu button
        const mBtnX = centerX - 80;
        const mBtnY = this.currentStage < STAGES.length - 1 ? 435 : 385;
        if (mx >= mBtnX && mx <= mBtnX + 160 && my >= mBtnY && my <= mBtnY + 45) {
            this.resetGame();
            return;
        }
    }

    startGame() {
        this.state = 'GET_READY';
        this.player.reset();
        this.player.y = GAME.HEIGHT / 2;
        this.obstacleManager.reset();
        this.collectibleManager.reset();
        this.particles.clear();
        this.ui.reset();
        this.score = 0;
        this.lives = 3;
        this.obstaclesPassed = 0;
        this.scrollSpeed = PHYSICS.SCROLL_SPEED;
        this.gameStartTime = 0; // Will be set when GET_READY ends
        this.lastObstacleCount = 0;
        this.isNewHighScore = false;
        this.gameOverDelay = 0;
        this.stageCompleteDelay = 0;

        // Set stage target for adventure mode
        if (this.gameMode === 'adventure') {
            this.stageTarget = STAGES[this.currentStage].obstacles;
            const themeName = STAGES[this.currentStage].theme;
            this.background.setTheme(themeName);
            this.obstacleManager.setTheme(themeName);
        } else {
            this.background.setTheme('village');
            this.obstacleManager.setTheme('village');
        }

        this.audio.startMusic();
    }

    resetGame() {
        this.state = 'MENU';
        this.player.reset();
        this.player.y = GAME.HEIGHT / 2 - 30;
        this.obstacleManager.reset();
        this.collectibleManager.reset();
        this.particles.clear();
        this.ui.reset();
        this.audio.stopMusic();
        // Reset to village theme for menu background
        this.background.setTheme('village');
    }

    hitObstacle() {
        // Try to use a life
        if (this.player.loseLife()) {
            // Still alive — bounce back with invincibility
            this.audio.playHit();
            this.particles.emitExplosion(this.player.x, this.player.y);
            this.ui.addScorePopup(this.player.x, this.player.y - 30,
                `💔 ${this.player.lives} left`, '#E53935');
            return;
        }
        // No lives — actual game over
        this.gameOver();
    }

    gameOver() {
        this.state = 'GAME_OVER';
        this.player.alive = false;
        this.gameOverDelay = 0;
        this.audio.playHit();
        this.audio.stopMusic();
        this.particles.emitExplosion(this.player.x, this.player.y);

        // High score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.isNewHighScore = true;
            localStorage.setItem('aami_highscore', this.highScore);
        }
    }

    stageComplete() {
        this.state = 'STAGE_COMPLETE';
        this.stageCompleteDelay = 0;
        this.audio.playEgg();
        this.audio.stopMusic();
        // Celebration particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.particles.emitSparkles(
                    randomRange(100, GAME.WIDTH - 100),
                    randomRange(100, GAME.HEIGHT - 200),
                    15
                );
            }, i * 200);
        }
    }

    resize() {
        const container = document.getElementById('gameContainer');
        const aspect = GAME.WIDTH / GAME.HEIGHT;
        let w = container.clientWidth;
        let h = container.clientHeight;

        if (w / h > aspect) {
            w = h * aspect;
        } else {
            h = w / aspect;
        }

        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
    }

    // === GAME LOOP ===

    loop(timestamp) {
        this.dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Cap delta time to prevent huge jumps
        if (this.dt > 100) this.dt = 16;

        this.update(this.dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.ui.update(dt);

        switch (this.state) {
            case 'MENU':
            case 'MODE_SELECT':
                this.updateMenu(dt);
                break;
            case 'GET_READY':
                this.updateGetReady(dt);
                break;
            case 'PLAYING':
                this.updatePlaying(dt);
                break;
            case 'STAGE_COMPLETE':
                this.stageCompleteDelay += dt;
                this.particles.update();
                break;
            case 'GAME_OVER':
                this.updateGameOver(dt);
                break;
        }
    }

    updateMenu(dt) {
        this.player.update(dt);
        this.background.update(1); // Slow background scroll
        this.particles.update();
    }

    updateGetReady(dt) {
        // Player bobs but doesn't fall
        this.player.update(dt);
        this.player.y = GAME.HEIGHT / 2 + Math.sin(performance.now() / 300) * 5;
        this.player.velocity = 0;

        this.background.update(1); // Slow background scroll
        this.particles.update();
    }

    updatePlaying(dt) {
        const now = performance.now();

        // Increase speed over time
        this.scrollSpeed = Math.min(
            PHYSICS.MAX_SCROLL_SPEED,
            PHYSICS.SCROLL_SPEED + (now - this.gameStartTime) * PHYSICS.SPEED_INCREMENT
        );

        const effectiveSpeed = this.player.hasSpeedBoost ? this.scrollSpeed * 1.4 : this.scrollSpeed;

        // In adventure mode, stop spawning after target reached
        if (this.gameMode === 'adventure' && this.obstacleManager.totalSpawned >= this.stageTarget) {
            this.obstacleManager.stopSpawning = true;
        }

        // Update systems
        this.player.update(dt);
        this.background.update(effectiveSpeed);
        this.obstacleManager.update(effectiveSpeed, now);
        this.collectibleManager.update(effectiveSpeed, this.player);
        this.particles.update();

        // Speed boost trail
        if (this.player.hasSpeedBoost) {
            this.particles.emitTrail(this.player.x - 25, this.player.y);
        }

        // Spawn collectibles when new obstacles appear
        if (this.obstacleManager.obstacles.length > this.lastObstacleCount) {
            const newest = this.obstacleManager.obstacles[this.obstacleManager.obstacles.length - 1];
            this.collectibleManager.spawnInGap(newest.x, newest.gapY, newest.gapSize);
            this.lastObstacleCount = this.obstacleManager.obstacles.length;
        }

        // Collision detection
        this.checkCollisions();

        // Ground collision
        if (this.player.y > GAME.HEIGHT - GAME.GROUND_HEIGHT - 15) {
            this.hitObstacle();
            if (this.state === 'GAME_OVER') return;
            this.player.y = GAME.HEIGHT / 2;
            return;
        }

        // Ceiling
        if (this.player.y < -30) {
            this.player.y = -30;
            this.player.velocity = 0;
        }

        // Score from passing obstacles
        for (const obs of this.obstacleManager.obstacles) {
            if (!obs.scored && obs.x + obs.w < this.player.x) {
                obs.scored = true;
                this.score++;
                this.obstaclesPassed++;
                this.audio.playScore();

                // Endless mode: cycle themes every N obstacles
                if (this.gameMode === 'endless') {
                    const themeNames = ['village', 'forest', 'mountain'];
                    const newIndex = Math.floor(this.obstaclesPassed / this.endlessThemeCycle) % themeNames.length;
                    if (newIndex !== this.endlessThemeIndex) {
                        this.endlessThemeIndex = newIndex;
                        const newTheme = themeNames[newIndex];
                        this.background.setTheme(newTheme);
                        this.obstacleManager.setTheme(newTheme);
                        const labels = ['🏡 Village', '🌲 Forest', '🏔️ Mountains'];
                        this.ui.addScorePopup(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 40,
                            labels[newIndex], '#FFD700');
                    }
                }

                // Check stage completion in adventure mode
                if (this.gameMode === 'adventure' && this.obstaclesPassed >= this.stageTarget) {
                    // Wait until all obstacles are off screen
                    if (this.obstacleManager.obstacles.every(o => o.scored)) {
                        this.stageComplete();
                        return;
                    }
                }
            }
        }

        // Adventure mode: check if cleared all obstacles after target
        if (this.gameMode === 'adventure' &&
            this.obstaclesPassed >= this.stageTarget &&
            this.obstacleManager.obstacles.length === 0) {
            this.stageComplete();
        }
    }

    checkCollisions() {
        const playerHitbox = this.player.getHitbox();

        // Obstacle collision
        for (const obs of this.obstacleManager.obstacles) {
            const topRect = obs.getTopRect();
            const bottomRect = obs.getBottomRect();

            if (rectsOverlap(playerHitbox, topRect) || rectsOverlap(playerHitbox, bottomRect)) {
                // Skip if invincible
                if (this.player.invincible) continue;

                if (this.player.hasShield) {
                    this.player.hasShield = false;
                    this.player.shieldTimer = 0;
                    this.particles.emitSparkles(this.player.x, this.player.y, 12);
                } else {
                    this.hitObstacle();
                    if (this.state === 'GAME_OVER') return;
                }
            }
        }

        // Collectible collision
        for (const item of this.collectibleManager.items) {
            if (item.collected) continue;
            const itemHitbox = item.getHitbox();

            if (rectsOverlap(playerHitbox, itemHitbox)) {
                item.collected = true;

                if (item.isPowerUp()) {
                    this.player.activatePowerUp(item.type);
                    this.audio.playPowerUp();
                    this.particles.emitSparkles(item.x, item.y, 10);
                    this.ui.addScorePopup(item.x, item.y - 20,
                        item.type === 'speed' ? '🚀 SPEED!' :
                            item.type === 'shield' ? '🛡️ SHIELD!' : '🧲 MAGNET!',
                        '#FFFFFF'
                    );
                } else {
                    const points = item.getPoints();
                    this.score += points;
                    if (item.type === 'egg') {
                        this.audio.playEgg();
                        this.particles.emitSparkles(item.x, item.y, 12);
                        this.ui.addScorePopup(item.x, item.y - 20, `+${points} 🥚`, COLORS.GOLDEN_EGG);
                    } else {
                        this.audio.playCoin();
                        this.particles.emitCollect(item.x, item.y, COLORS.COIN);
                        this.ui.addScorePopup(item.x, item.y - 15, `+${points}`, COLORS.COIN);
                    }
                }
            }
        }
    }

    updateGameOver(dt) {
        this.gameOverDelay += dt;
        this.player.update(dt);
        this.particles.update();
    }

    // === DRAW ===

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Apply screen shake
        ctx.save();
        ctx.translate(this.particles.screenShake.x, this.particles.screenShake.y);

        // Background
        this.background.draw(ctx);

        // Obstacles
        if (this.state !== 'MENU' && this.state !== 'MODE_SELECT') {
            this.obstacleManager.draw(ctx);
        }

        // Collectibles
        if (this.state === 'PLAYING') {
            this.collectibleManager.draw(ctx);
        }

        // Player
        this.player.draw(ctx, this.state === 'MENU' || this.state === 'MODE_SELECT');

        // Particles
        this.particles.draw(ctx);

        ctx.restore();

        // UI layer (no shake)
        switch (this.state) {
            case 'MENU':
                this.ui.drawMenu(ctx);
                break;
            case 'MODE_SELECT':
                this.ui.drawModeSelect(ctx);
                break;
            case 'GET_READY':
                this.ui.drawGetReady(ctx);
                // Also draw HUD elements (score, lives) so player knows what's up
                const stageInfoReady = this.gameMode === 'adventure' ? {
                    stage: this.currentStage,
                    passed: 0,
                    target: this.stageTarget,
                    stageName: STAGES[this.currentStage].name,
                    stageEmoji: STAGES[this.currentStage].emoji,
                } : null;
                this.ui.drawHUD(ctx, 0, this.highScore, this.player, this.lives, stageInfoReady);
                break;
            case 'PLAYING':
                const stageInfo = this.gameMode === 'adventure' ? {
                    stage: this.currentStage,
                    passed: this.obstaclesPassed,
                    target: this.stageTarget,
                    stageName: STAGES[this.currentStage].name,
                    stageEmoji: STAGES[this.currentStage].emoji,
                } : null;
                this.ui.drawHUD(ctx, this.score, this.highScore, this.player, this.player.lives, stageInfo);
                break;
            case 'STAGE_COMPLETE':
                this.ui.drawStageComplete(ctx, this.currentStage, this.score,
                    this.currentStage < STAGES.length - 1);
                break;
            case 'GAME_OVER':
                this.ui.drawGameOver(ctx, this.score, this.highScore, this.isNewHighScore);
                break;
        }

        // Mute button always visible
        this.ui.drawMuteButton(ctx, this.audio.muted);
    }
}

// === Initialize ===
window.addEventListener('load', () => {
    new Game();
});
