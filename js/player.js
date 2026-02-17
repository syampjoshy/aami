// ============================================
// Aami & the Flying Hen — Player (Hen + Aami)
// ============================================

class Player {
    constructor() {
        this.reset();
        this.wingFrame = 0;
        this.wingTimer = 0;
        this.wingSpeed = 150; // ms per frame
        this.flapAnimation = 0;
    }

    reset() {
        this.x = 120;
        this.y = GAME.HEIGHT / 2;
        this.w = 50;
        this.h = 40;
        this.velocity = 0;
        this.rotation = 0;
        this.alive = true;
        this.lives = 3;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.hasShield = false;
        this.shieldTimer = 0;
        this.hasSpeedBoost = false;
        this.speedTimer = 0;
        this.hasMagnet = false;
        this.magnetTimer = 0;
        this.wingFrame = 0;
        this.flapAnimation = 0;
        this.bobOffset = 0;
        this.bobTimer = 0;
    }

    loseLife() {
        this.lives--;
        if (this.lives > 0) {
            // Respawn in place with invincibility
            this.velocity = PHYSICS.JUMP_VELOCITY * 0.8;
            this.invincible = true;
            this.invincibleTimer = 2000; // 2 seconds of invincibility
            return true; // still alive
        }
        return false; // no lives left
    }

    flap() {
        if (!this.alive) return;
        this.velocity = PHYSICS.JUMP_VELOCITY;
        this.flapAnimation = 1.0;
        this.wingFrame = 0;
    }

    update(dt) {
        if (!this.alive) {
            this.velocity += PHYSICS.GRAVITY * 1.5;
            this.y += this.velocity;
            this.rotation = Math.min(this.rotation + 0.05, Math.PI / 2);
            return;
        }

        // Gravity
        this.velocity += PHYSICS.GRAVITY;
        this.velocity = Math.min(this.velocity, PHYSICS.MAX_FALL_SPEED);
        this.y += this.velocity;

        // Rotation based on velocity
        const targetRotation = clamp(this.velocity * 0.06, -0.4, Math.PI / 4);
        this.rotation = lerp(this.rotation, targetRotation, 0.1);

        // Wing animation
        this.wingTimer += dt;
        if (this.wingTimer > this.wingSpeed) {
            this.wingTimer = 0;
            this.wingFrame = (this.wingFrame + 1) % 3;
        }

        // Flap animation decay
        if (this.flapAnimation > 0) {
            this.flapAnimation -= 0.05;
        }

        // Idle bob (menu state)
        this.bobTimer += dt;
        this.bobOffset = Math.sin(this.bobTimer / 300) * 4;

        // Invincibility timer
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Power-up timers
        if (this.hasShield) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) this.hasShield = false;
        }
        if (this.hasSpeedBoost) {
            this.speedTimer -= dt;
            if (this.speedTimer <= 0) this.hasSpeedBoost = false;
        }
        if (this.hasMagnet) {
            this.magnetTimer -= dt;
            if (this.magnetTimer <= 0) this.hasMagnet = false;
        }

        // Bounds
        if (this.y < -20) {
            this.y = -20;
            this.velocity = 0;
        }
    }

    getHitbox() {
        // Slightly smaller than visual for forgiving gameplay
        return {
            x: this.x - 16,
            y: this.y - 14,
            w: 32,
            h: 28,
        };
    }

    getMagnetRange() {
        return { cx: this.x, cy: this.y, r: 120 };
    }

    activatePowerUp(type) {
        switch (type) {
            case 'shield':
                this.hasShield = true;
                this.shieldTimer = POWERUP.DURATION;
                break;
            case 'speed':
                this.hasSpeedBoost = true;
                this.speedTimer = POWERUP.DURATION;
                break;
            case 'magnet':
                this.hasMagnet = true;
                this.magnetTimer = POWERUP.DURATION;
                break;
        }
    }

    // Get color tints based on damage state
    getDamageColors() {
        if (this.lives >= 3) {
            return {
                body: COLORS.HEN_BODY,       // white
                wing: COLORS.HEN_WING,       // cream
                tail: '#E8D5B7',
                tailInner: COLORS.HEN_BODY,
                tint: null,
            };
        } else if (this.lives === 2) {
            return {
                body: '#E0D8CF',             // dirty grayish-white
                wing: '#D4C9B5',             // scuffed cream
                tail: '#C9B99A',
                tailInner: '#E0D8CF',
                tint: 'rgba(139, 119, 80, 0.12)',
            };
        } else {
            return {
                body: '#D4A8A8',             // reddish bruised
                wing: '#C49888',             // pinkish-brown
                tail: '#B08878',
                tailInner: '#D4A8A8',
                tint: 'rgba(180, 60, 60, 0.15)',
            };
        }
    }

    draw(ctx, isMenu = false) {
        ctx.save();
        const drawY = isMenu ? this.y + this.bobOffset : this.y;

        // Blink during invincibility
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.3;
        }

        ctx.translate(this.x, drawY);
        ctx.rotate(this.rotation);

        const dmg = this.getDamageColors();

        // --- Draw Hen ---
        const wingOffsets = [0, -4, -2]; // Wing flap animation
        const wingY = wingOffsets[this.wingFrame];

        // Tail feathers
        ctx.fillStyle = dmg.tail;
        ctx.beginPath();
        ctx.ellipse(-22, -5, 8, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = dmg.tailInner;
        ctx.beginPath();
        ctx.ellipse(-20, -3, 6, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = dmg.body;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body shading
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 20, 10, 0, 0, Math.PI);
        ctx.fill();

        // Wing
        ctx.fillStyle = dmg.wing;
        ctx.beginPath();
        ctx.ellipse(-2, wingY + 2, 14, 9, -0.15, 0, Math.PI * 2);
        ctx.fill();
        // Wing detail
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Damage marks on body
        if (this.lives <= 2) {
            // Scratches
            ctx.strokeStyle = 'rgba(120, 60, 40, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-8, -5);
            ctx.lineTo(-3, 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-6, -3);
            ctx.lineTo(-1, 4);
            ctx.stroke();
        }
        if (this.lives <= 1) {
            // More scratches + bandage
            ctx.strokeStyle = 'rgba(150, 40, 30, 0.4)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(5, -8);
            ctx.lineTo(10, -1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(7, -7);
            ctx.lineTo(12, 0);
            ctx.stroke();

            // Bandage on body
            ctx.fillStyle = '#F5E6CA';
            ctx.save();
            ctx.translate(8, 3);
            ctx.rotate(0.4);
            ctx.fillRect(-6, -3, 12, 6);
            // Bandage cross
            ctx.fillStyle = '#E57373';
            ctx.fillRect(-2, -2, 4, 4);
            ctx.restore();
        }

        // Damage tint overlay
        if (dmg.tint) {
            ctx.fillStyle = dmg.tint;
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Feet
        ctx.strokeStyle = COLORS.HEN_FEET;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        // Left foot
        ctx.beginPath();
        ctx.moveTo(-6, 14);
        ctx.lineTo(-8, 20);
        ctx.moveTo(-8, 20);
        ctx.lineTo(-12, 22);
        ctx.moveTo(-8, 20);
        ctx.lineTo(-6, 23);
        ctx.stroke();
        // Right foot
        ctx.beginPath();
        ctx.moveTo(4, 14);
        ctx.lineTo(2, 20);
        ctx.moveTo(2, 20);
        ctx.lineTo(-2, 22);
        ctx.moveTo(2, 20);
        ctx.lineTo(4, 23);
        ctx.stroke();

        // Head
        ctx.fillStyle = dmg.body;
        ctx.beginPath();
        ctx.arc(18, -8, 10, 0, Math.PI * 2);
        ctx.fill();

        // Head damage tint
        if (dmg.tint) {
            ctx.fillStyle = dmg.tint;
            ctx.beginPath();
            ctx.arc(18, -8, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Eye
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(22, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Eye highlight
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(23, -11, 1, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = COLORS.HEN_BEAK;
        ctx.beginPath();
        ctx.moveTo(27, -8);
        ctx.lineTo(33, -6);
        ctx.lineTo(27, -4);
        ctx.closePath();
        ctx.fill();

        // Comb
        ctx.fillStyle = COLORS.HEN_COMB;
        ctx.beginPath();
        ctx.arc(16, -17, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, -16, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(13, -16, 3, 0, Math.PI * 2);
        ctx.fill();

        // Wattle
        ctx.fillStyle = COLORS.HEN_COMB;
        ctx.beginPath();
        ctx.ellipse(22, -1, 2.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // --- Draw Aami on the hen ---
        this.drawAami(ctx);

        ctx.restore();

        // Shield visual
        if (this.hasShield) {
            ctx.save();
            ctx.translate(this.x, drawY);
            ctx.strokeStyle = COLORS.EGG_SHIELD;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 30, 24, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = COLORS.EGG_SHIELD;
            ctx.fill();
            ctx.restore();
        }

        // Speed boost trail indicator
        if (this.hasSpeedBoost) {
            ctx.save();
            ctx.translate(this.x, drawY);
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = COLORS.SPEED_BOOST;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(-25 - i * 10, -3);
                ctx.lineTo(-35 - i * 10, 0);
                ctx.lineTo(-25 - i * 10, 3);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    drawAami(ctx) {
        // Aami sitting on the hen
        const aX = -2;
        const aY = -20;

        // Body / dress
        ctx.fillStyle = COLORS.AAMI_DRESS;
        ctx.beginPath();
        ctx.moveTo(aX - 8, aY + 5);
        ctx.quadraticCurveTo(aX, aY + 14, aX + 8, aY + 5);
        ctx.lineTo(aX + 6, aY - 2);
        ctx.lineTo(aX - 6, aY - 2);
        ctx.closePath();
        ctx.fill();

        // Dress pattern (little dots)
        ctx.fillStyle = COLORS.AAMI_DRESS_2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(aX - 3 + i * 3, aY + 4 + (i % 2) * 3, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Head
        ctx.fillStyle = COLORS.AAMI_SKIN;
        ctx.beginPath();
        ctx.arc(aX, aY - 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = COLORS.AAMI_HAIR;
        ctx.beginPath();
        ctx.arc(aX, aY - 8, 6.5, -Math.PI, 0);
        ctx.fill();
        // Hair bun / ponytail
        ctx.beginPath();
        ctx.arc(aX - 5, aY - 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // Hair ribbon
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(aX - 5, aY - 8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(aX + 2, aY - 7, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(aX + 1, aY - 4, 2, 0, Math.PI);
        ctx.stroke();

        // Arms holding on
        ctx.strokeStyle = COLORS.AAMI_SKIN;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        // Left arm
        ctx.beginPath();
        ctx.moveTo(aX - 6, aY + 2);
        ctx.quadraticCurveTo(aX - 10, aY + 6, aX - 8, aY + 10);
        ctx.stroke();
        // Right arm
        ctx.beginPath();
        ctx.moveTo(aX + 6, aY + 2);
        ctx.quadraticCurveTo(aX + 10, aY + 6, aX + 10, aY + 10);
        ctx.stroke();
    }
}
