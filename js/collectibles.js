// ============================================
// Aami & the Flying Hen — Collectibles & Power-ups
// ============================================

class Collectible {
    constructor(x, y, type = 'coin') {
        this.x = x;
        this.y = y;
        this.type = type; // 'coin', 'egg', 'speed', 'shield', 'magnet'
        this.collected = false;
        this.bobTimer = randomRange(0, Math.PI * 2);
        this.rotation = 0;
        this.size = type === 'egg' ? 14 : type === 'coin' ? 10 : 16;
        this.attracting = false;
    }

    update(scrollSpeed, player) {
        this.x -= scrollSpeed;
        this.bobTimer += 0.05;
        this.rotation += 0.03;

        // Magnet attraction
        if (player && player.hasMagnet && !this.isPowerUp()) {
            const mag = player.getMagnetRange();
            const dist = distance(this.x, this.y, mag.cx, mag.cy);
            if (dist < mag.r) {
                this.attracting = true;
                const angle = Math.atan2(mag.cy - this.y, mag.cx - this.x);
                const speed = (mag.r - dist) / mag.r * 5;
                this.x += Math.cos(angle) * speed;
                this.y += Math.sin(angle) * speed;
            }
        }
    }

    isPowerUp() {
        return ['speed', 'shield', 'magnet'].includes(this.type);
    }

    isOffScreen() {
        return this.x < -30;
    }

    getHitbox() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2 + Math.sin(this.bobTimer) * 3,
            w: this.size,
            h: this.size,
        };
    }

    getPoints() {
        switch (this.type) {
            case 'coin': return 1;
            case 'egg': return 5;
            default: return 0;
        }
    }

    draw(ctx) {
        if (this.collected) return;

        const bobY = this.y + Math.sin(this.bobTimer) * 4;

        ctx.save();
        ctx.translate(this.x, bobY);

        // Glow effect for power-ups
        if (this.isPowerUp()) {
            this.drawPowerUpGlow(ctx);
        }

        switch (this.type) {
            case 'coin': this.drawCoin(ctx); break;
            case 'egg': this.drawEgg(ctx); break;
            case 'speed': this.drawSpeedBoost(ctx); break;
            case 'shield': this.drawShield(ctx); break;
            case 'magnet': this.drawMagnet(ctx); break;
        }

        ctx.restore();

        // Magnet attraction visual
        if (this.attracting) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = COLORS.MAGNET;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(this.x, bobY);
            ctx.lineTo(this.x - 10, bobY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }

    drawCoin(ctx) {
        ctx.rotate(this.rotation);

        // Coin body
        const grad = ctx.createRadialGradient(-2, -2, 0, 0, 0, 10);
        grad.addColorStop(0, COLORS.COIN_SHINE);
        grad.addColorStop(1, COLORS.COIN);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Dollar sign / star
        ctx.fillStyle = '#DAA520';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 0.5);

        // Shine
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-3, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEgg(ctx) {
        // Golden egg
        const grad = ctx.createRadialGradient(-2, -3, 0, 0, 0, 14);
        grad.addColorStop(0, COLORS.GOLDEN_EGG_SHINE);
        grad.addColorStop(0.7, COLORS.GOLDEN_EGG);
        grad.addColorStop(1, '#E65100');
        ctx.fillStyle = grad;

        // Egg shape (wider at bottom)
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.bezierCurveTo(-10, -8, -10, 6, -7, 10);
        ctx.bezierCurveTo(-4, 14, 4, 14, 7, 10);
        ctx.bezierCurveTo(10, 6, 10, -8, 0, -13);
        ctx.closePath();
        ctx.fill();

        // Shine
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(-3, -5, 2, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle
        ctx.globalAlpha = 0.6 + Math.sin(this.bobTimer * 3) * 0.3;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(4, -8, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPowerUpGlow(ctx) {
        let color;
        switch (this.type) {
            case 'speed': color = COLORS.SPEED_BOOST; break;
            case 'shield': color = COLORS.EGG_SHIELD; break;
            case 'magnet': color = COLORS.MAGNET; break;
        }

        ctx.globalAlpha = 0.15 + Math.sin(this.bobTimer * 2) * 0.1;
        const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 25);
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(-25, -25, 50, 50);
        ctx.globalAlpha = 1;
    }

    drawSpeedBoost(ctx) {
        // Lightning bolt
        ctx.fillStyle = COLORS.SPEED_BOOST;
        ctx.strokeStyle = '#1565C0';
        ctx.lineWidth = 1.5;

        // Circle background
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
        ctx.fill();
        ctx.stroke();

        // Arrow/bolt icon
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(-4, -8);
        ctx.lineTo(2, -2);
        ctx.lineTo(-1, -2);
        ctx.lineTo(4, 8);
        ctx.lineTo(-2, 2);
        ctx.lineTo(1, 2);
        ctx.closePath();
        ctx.fill();
    }

    drawShield(ctx) {
        // Shield shape
        ctx.fillStyle = 'rgba(156, 39, 176, 0.3)';
        ctx.strokeStyle = COLORS.EGG_SHIELD;
        ctx.lineWidth = 2;

        // Shield outline
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.bezierCurveTo(-14, -8, -12, 4, 0, 14);
        ctx.bezierCurveTo(12, 4, 14, -8, 0, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Egg icon inside
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(0, 1, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMagnet(ctx) {
        // Magnet U-shape
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
        ctx.fill();
        ctx.strokeStyle = COLORS.MAGNET;
        ctx.lineWidth = 2;
        ctx.stroke();

        // U magnet icon
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 2, 6, 0, Math.PI);
        ctx.stroke();

        // Magnet tips
        ctx.fillStyle = '#F44336';
        ctx.fillRect(-7, -4, 4, 8);
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(3, -4, 4, 8);
    }
}

class CollectibleManager {
    constructor() {
        this.items = [];
    }

    spawnInGap(gapX, gapY, gapSize) {
        const centerY = gapY + gapSize / 2;

        // Always spawn a coin in the gap
        this.items.push(new Collectible(gapX + 35, centerY, 'coin'));

        // Sometimes spawn golden egg
        if (Math.random() < 0.2) {
            this.items.push(new Collectible(
                gapX + 35,
                centerY + randomRange(-gapSize * 0.25, gapSize * 0.25),
                'egg'
            ));
        }

        // Rare power-up spawn
        if (Math.random() < POWERUP.SPAWN_CHANCE) {
            const type = POWERUP.TYPES[randomInt(0, POWERUP.TYPES.length - 1)];
            this.items.push(new Collectible(
                gapX + 35,
                centerY + randomRange(-gapSize * 0.2, gapSize * 0.2),
                type
            ));
        }
    }

    update(scrollSpeed, player) {
        for (const item of this.items) {
            item.update(scrollSpeed, player);
        }
        this.items = this.items.filter(i => !i.collected && !i.isOffScreen());
    }

    draw(ctx) {
        for (const item of this.items) {
            item.draw(ctx);
        }
    }

    reset() {
        this.items = [];
    }
}
