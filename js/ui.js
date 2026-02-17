// ============================================
// Aami & the Flying Hen — UI System
// ============================================

class UI {
    constructor() {
        this.scorePopups = [];
        this.menuAlpha = 0;
        this.menuAnimTimer = 0;
        this.gameOverAlpha = 0;
    }

    update(dt) {
        this.menuAnimTimer += dt;
        this.scorePopups = this.scorePopups.filter(p => {
            p.y -= 1;
            p.life -= 0.02;
            return p.life > 0;
        });
    }

    addScorePopup(x, y, text, color = '#FFD700') {
        this.scorePopups.push({
            x, y, text, color,
            life: 1.0,
        });
    }

    drawMenu(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        // Title
        const titleY = 120 + Math.sin(this.menuAnimTimer / 500) * 8;

        // Title glow
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Aami & the Flying Hen', GAME.WIDTH / 2, titleY);
        ctx.restore();

        // Subtitle with outline
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 3;
        ctx.strokeText('Chase the eagle! Save the golden egg!', GAME.WIDTH / 2, titleY + 45);
        ctx.fillText('Chase the eagle! Save the golden egg!', GAME.WIDTH / 2, titleY + 45);

        // Story box
        const boxY = 220;
        const boxW = 480;
        const boxH = 160;
        const boxX = (GAME.WIDTH - boxW) / 2;

        // Glassmorphism box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.stroke();

        // Story text
        ctx.fillStyle = '#FFF';
        ctx.font = '14px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        const storyLines = [
            'Aami is a brave 6-year-old girl from a colorful village.',
            'She loves her pet hen, who lays golden eggs.',
            'One day, a sneaky eagle steals a precious egg!',
            'Aami jumps on her hen and together they take flight!',
            'Help them dodge obstacles and chase the eagle!',
        ];
        storyLines.forEach((line, i) => {
            ctx.fillText(line, GAME.WIDTH / 2, boxY + 28 + i * 26);
        });

        // Play button
        const btnW = 220;
        const btnH = 55;
        const btnX = (GAME.WIDTH - btnW) / 2;
        const btnY = boxY + boxH + 30;

        // Button glow
        ctx.save();
        ctx.shadowColor = COLORS.UI_BUTTON;
        ctx.shadowBlur = 15;

        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
        btnGrad.addColorStop(0, '#66BB6A');
        btnGrad.addColorStop(1, '#388E3C');
        ctx.fillStyle = btnGrad;
        this.roundRect(ctx, btnX, btnY, btnW, btnH, 12);
        ctx.fill();
        ctx.restore();

        // Button text
        const pulse = Math.sin(this.menuAnimTimer / 300) * 0.1 + 1;
        ctx.save();
        ctx.translate(GAME.WIDTH / 2, btnY + btnH / 2);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐔  TAP TO PLAY  🐔', 0, 0);
        ctx.restore();

        // Controls hint
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '15px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Click / Tap / Space to flap', GAME.WIDTH / 2, btnY + btnH + 35);

        // High score
        const hs = localStorage.getItem('aami_highscore') || 0;
        if (hs > 0) {
            ctx.fillStyle = COLORS.UI_ACCENT;
            ctx.font = 'bold 16px "Baloo 2", "Comic Sans MS", cursive';
            ctx.fillText(`🏆 Best: ${hs}`, GAME.WIDTH / 2, btnY + btnH + 60);
        }
    }

    drawHUD(ctx, score, highScore, player, lives, stageInfo) {
        // Score display (top left)
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${score}`, 20, 15);

        // Egg icon next to score
        ctx.font = '24px Arial';
        ctx.fillText('🥚', 20 + ctx.measureText(`${score}`).width + 5, 20);

        ctx.restore();

        // Lives (hearts) display
        ctx.save();
        ctx.font = '22px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        for (let i = 0; i < 3; i++) {
            ctx.fillText(i < lives ? '❤️' : '🖤', 20 + i * 28, 55);
        }
        ctx.restore();

        // Stage progress bar (adventure mode)
        if (stageInfo) {
            const barW = 200;
            const barH = 16;
            const barX = GAME.WIDTH / 2 - barW / 2;
            const barY = 12;
            const progress = Math.min(stageInfo.passed / stageInfo.target, 1);

            // Stage label
            ctx.save();
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px "Baloo 2", "Comic Sans MS", cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`${stageInfo.stageEmoji} ${stageInfo.stageName}`, GAME.WIDTH / 2, barY - 1);

            // Bar background
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this.roundRect(ctx, barX, barY + 16, barW, barH, 8);
            ctx.fill();

            // Bar fill
            const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
            fillGrad.addColorStop(0, '#4CAF50');
            fillGrad.addColorStop(1, '#8BC34A');
            ctx.fillStyle = fillGrad;
            if (progress > 0) {
                this.roundRect(ctx, barX, barY + 16, barW * progress, barH, 8);
                ctx.fill();
            }

            // Progress text
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 11px "Baloo 2", "Comic Sans MS", cursive';
            ctx.fillText(`${stageInfo.passed} / ${stageInfo.target}`, GAME.WIDTH / 2, barY + 17);

            ctx.restore();
        }

        // Power-up indicators
        let indicatorX = GAME.WIDTH - 20;
        const indicatorY = 20;

        if (player.hasShield) {
            this.drawPowerUpIndicator(ctx, indicatorX, indicatorY, '🛡️', player.shieldTimer, POWERUP.DURATION, COLORS.EGG_SHIELD);
            indicatorX -= 45;
        }
        if (player.hasSpeedBoost) {
            this.drawPowerUpIndicator(ctx, indicatorX, indicatorY, '🚀', player.speedTimer, POWERUP.DURATION, COLORS.SPEED_BOOST);
            indicatorX -= 45;
        }
        if (player.hasMagnet) {
            this.drawPowerUpIndicator(ctx, indicatorX, indicatorY, '🧲', player.magnetTimer, POWERUP.DURATION, COLORS.MAGNET);
            indicatorX -= 45;
        }

        // Score popups
        for (const popup of this.scorePopups) {
            ctx.save();
            ctx.globalAlpha = popup.life;
            ctx.fillStyle = popup.color;
            ctx.font = 'bold 18px "Baloo 2", "Comic Sans MS", cursive';
            ctx.textAlign = 'center';
            ctx.fillText(popup.text, popup.x, popup.y);
            ctx.restore();
        }
    }

    drawGetReady(ctx) {
        // Dark overlay (lighter than menu)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        const centerX = GAME.WIDTH / 2;
        const centerY = GAME.HEIGHT / 2;

        // "Get Ready!" text
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Get Ready!', centerX, centerY - 80);
        ctx.restore();

        // Tap instructions
        const pulse = Math.sin(this.menuAnimTimer / 200) * 0.1 + 1;
        ctx.save();
        ctx.translate(centerX, centerY + 40);
        ctx.scale(pulse, pulse);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Tap to Fly!', 0, 0);

        // Hand icon
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👆', 0, 50);

        ctx.restore();
    }

    drawPowerUpIndicator(ctx, x, y, emoji, timeLeft, maxTime, color) {
        const ratio = timeLeft / maxTime;

        ctx.save();
        ctx.textAlign = 'right';

        // Background circle
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(x - 15, y + 15, 18, 0, Math.PI * 2);
        ctx.fill();

        // Timer arc
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x - 15, y + 15, 18, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
        ctx.stroke();

        // Icon
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText(emoji, x - 15, y + 16);

        ctx.restore();
    }

    drawGameOver(ctx, score, highScore, isNewHigh) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        const centerX = GAME.WIDTH / 2;

        // Game Over title
        ctx.save();
        ctx.shadowColor = '#E53935';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#E53935';
        ctx.font = 'bold 52px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', centerX, 160);
        ctx.restore();

        // Score card
        const cardW = 320;
        const cardH = 200;
        const cardX = (GAME.WIDTH - cardW) / 2;
        const cardY = 200;

        // Card background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
        ctx.stroke();

        // Score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '22px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Score', centerX, cardY + 35);

        ctx.fillStyle = COLORS.UI_ACCENT;
        ctx.font = 'bold 48px "Baloo 2", "Comic Sans MS", cursive';
        ctx.fillText(`${score}`, centerX, cardY + 80);

        // High score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px "Baloo 2", "Comic Sans MS", cursive';
        ctx.fillText(`🏆 Best: ${highScore}`, centerX, cardY + 120);

        // New high score badge
        if (isNewHigh) {
            ctx.save();
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 22px "Baloo 2", "Comic Sans MS", cursive';
            const pulse = Math.sin(this.menuAnimTimer / 200) * 0.15 + 1;
            ctx.translate(centerX, cardY + 155);
            ctx.scale(pulse, pulse);
            ctx.fillText('🎉 NEW HIGH SCORE! 🎉', 0, 0);
            ctx.restore();
        }

        // Retry button
        const btnW = 200;
        const btnH = 50;
        const btnX = (GAME.WIDTH - btnW) / 2;
        const btnY = cardY + cardH + 25;

        ctx.save();
        ctx.shadowColor = COLORS.UI_BUTTON;
        ctx.shadowBlur = 12;
        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
        btnGrad.addColorStop(0, '#66BB6A');
        btnGrad.addColorStop(1, '#388E3C');
        ctx.fillStyle = btnGrad;
        this.roundRect(ctx, btnX, btnY, btnW, btnH, 10);
        ctx.fill();
        ctx.restore();

        const pulse = Math.sin(this.menuAnimTimer / 300) * 0.08 + 1;
        ctx.save();
        ctx.translate(centerX, btnY + btnH / 2);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔄  TRY AGAIN', 0, 0);
        ctx.restore();

        // Hint
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Click / Tap / Space to retry', centerX, btnY + btnH + 30);
    }

    drawModeSelect(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        const centerX = GAME.WIDTH / 2;

        // Title
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 42px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Choose Your Mode', centerX, 110);
        ctx.restore();

        // Subtitle
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '16px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('How do you want to play?', centerX, 155);

        // --- Endless Mode Card ---
        const card1X = centerX - 230;
        const cardY = 200;
        const cardW = 200;
        const cardH = 240;
        this.drawModeCard(ctx, card1X, cardY, cardW, cardH, {
            emoji: '♾️',
            title: 'Endless',
            desc: 'Fly forever!\nHow far can\nyou go?',
            color1: '#1565C0',
            color2: '#0D47A1',
            highlight: '#42A5F5',
        });

        // --- Adventure Mode Card ---
        const card2X = centerX + 30;
        this.drawModeCard(ctx, card2X, cardY, cardW, cardH, {
            emoji: '🏰',
            title: 'Adventure',
            desc: '3 stages!\nVillage → Forest\n→ Mountains',
            color1: '#E65100',
            color2: '#BF360C',
            highlight: '#FF9800',
        });

        // Back hint
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '13px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Click a mode to start', centerX, cardY + cardH + 40);
    }

    drawModeCard(ctx, x, y, w, h, opts) {
        // Card background with gradient
        ctx.save();
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, opts.color1);
        grad.addColorStop(1, opts.color2);
        ctx.fillStyle = grad;
        ctx.shadowColor = opts.color1;
        ctx.shadowBlur = 15;
        this.roundRect(ctx, x, y, w, h, 16);
        ctx.fill();
        ctx.restore();

        // Border glow
        ctx.strokeStyle = opts.highlight;
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, w, h, 16);
        ctx.stroke();

        // Emoji
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opts.emoji, x + w / 2, y + 55);

        // Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px "Baloo 2", "Comic Sans MS", cursive';
        ctx.fillText(opts.title, x + w / 2, y + 110);

        // Description (multiline)
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '14px "Baloo 2", "Comic Sans MS", cursive';
        const lines = opts.desc.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, x + w / 2, y + 145 + i * 22);
        });

        // Subtle pulse border
        const pulse = Math.sin(Date.now() / 400) * 0.15 + 0.85;
        ctx.save();
        ctx.globalAlpha = pulse * 0.3;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        this.roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 14);
        ctx.stroke();
        ctx.restore();
    }

    drawStageComplete(ctx, stageIndex, score, hasNextStage) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

        const centerX = GAME.WIDTH / 2;
        const stage = STAGES[stageIndex];

        // Victory header
        ctx.save();
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 48px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Stage Clear! 🎉', centerX, 120);
        ctx.restore();

        // Stage name
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText(`${stage.emoji} ${stage.name}`, centerX, 175);

        // Score card
        const cardW = 300;
        const cardH = 140;
        const cardX = (GAME.WIDTH - cardW) / 2;
        const cardY = 210;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
        ctx.stroke();

        // Score
        ctx.fillStyle = '#FFF';
        ctx.font = '18px "Baloo 2", "Comic Sans MS", cursive';
        ctx.fillText('Score', centerX, cardY + 30);
        ctx.fillStyle = COLORS.UI_ACCENT;
        ctx.font = 'bold 42px "Baloo 2", "Comic Sans MS", cursive';
        ctx.fillText(`${score}`, centerX, cardY + 72);

        // Stars (based on lives remaining)
        ctx.font = '28px Arial';
        ctx.fillText('⭐⭐⭐', centerX, cardY + 115);

        let btnY = cardY + cardH + 25;

        // Next stage button
        if (hasNextStage) {
            const nextStage = STAGES[stageIndex + 1];
            const nBtnW = 210;
            const nBtnH = 50;
            const nBtnX = centerX - nBtnW / 2;

            ctx.save();
            ctx.shadowColor = '#4CAF50';
            ctx.shadowBlur = 12;
            const btnGrad = ctx.createLinearGradient(nBtnX, btnY, nBtnX, btnY + nBtnH);
            btnGrad.addColorStop(0, '#66BB6A');
            btnGrad.addColorStop(1, '#388E3C');
            ctx.fillStyle = btnGrad;
            this.roundRect(ctx, nBtnX, btnY, nBtnW, nBtnH, 10);
            ctx.fill();
            ctx.restore();

            const pulse = Math.sin(this.menuAnimTimer / 300) * 0.08 + 1;
            ctx.save();
            ctx.translate(centerX, btnY + nBtnH / 2);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 20px "Baloo 2", "Comic Sans MS", cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Next: ${nextStage.emoji} ${nextStage.name}`, 0, 0);
            ctx.restore();

            btnY += 65;
        } else {
            // Final stage cleared!
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 22px "Baloo 2", "Comic Sans MS", cursive';
            ctx.textAlign = 'center';
            const pulse2 = Math.sin(this.menuAnimTimer / 200) * 0.1 + 1;
            ctx.save();
            ctx.translate(centerX, btnY);
            ctx.scale(pulse2, pulse2);
            ctx.fillText('🌟 ALL STAGES CLEARED! 🌟', 0, 0);
            ctx.restore();
            btnY += 40;
        }

        // Menu button
        const mBtnW = 160;
        const mBtnH = 45;
        const mBtnX = centerX - mBtnW / 2;

        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        this.roundRect(ctx, mBtnX, btnY, mBtnW, mBtnH, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        this.roundRect(ctx, mBtnX, btnY, mBtnW, mBtnH, 10);
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px "Baloo 2", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏠  Menu', centerX, btnY + mBtnH / 2);
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    drawMuteButton(ctx, muted) {
        // Sound toggle in top right
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(GAME.WIDTH - 30, GAME.HEIGHT - 30, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(muted ? '🔇' : '🔊', GAME.WIDTH - 30, GAME.HEIGHT - 29);
        ctx.restore();
    }

    reset() {
        this.scorePopups = [];
        this.gameOverAlpha = 0;
    }
}
