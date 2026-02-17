// ============================================
// Aami & the Flying Hen — Particle System
// ============================================

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || randomRange(-2, 2);
        this.vy = options.vy || randomRange(-3, -1);
        this.size = options.size || randomRange(2, 5);
        this.color = options.color || '#FFFFFF';
        this.life = options.life || 1.0;
        this.decay = options.decay || randomRange(0.01, 0.03);
        this.gravity = options.gravity || 0.05;
        this.rotation = randomRange(0, Math.PI * 2);
        this.rotationSpeed = randomRange(-0.1, 0.1);
        this.type = options.type || 'circle'; // 'circle', 'feather', 'star'
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'feather') {
            this.drawFeather(ctx);
        } else if (this.type === 'star') {
            this.drawStar(ctx);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawFeather(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.5, this.size * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Feather spine
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 2);
        ctx.lineTo(0, this.size * 2);
        ctx.stroke();
    }

    drawStar(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const outerX = Math.cos(angle) * this.size;
            const outerY = Math.sin(angle) * this.size;
            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * (this.size * 0.4);
            const innerY = Math.sin(innerAngle) * (this.size * 0.4);
            if (i === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, decay: 0.9 };
    }

    update() {
        this.particles = this.particles.filter(p => p.update());

        // Screen shake decay
        if (this.screenShake.intensity > 0.1) {
            this.screenShake.x = randomRange(-1, 1) * this.screenShake.intensity;
            this.screenShake.y = randomRange(-1, 1) * this.screenShake.intensity;
            this.screenShake.intensity *= this.screenShake.decay;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            this.screenShake.intensity = 0;
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    // --- Effect spawners ---

    emitFeathers(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, {
                vx: randomRange(-3, 1),
                vy: randomRange(-2, -0.5),
                size: randomRange(3, 6),
                color: COLORS.FEATHER_COLORS[randomInt(0, COLORS.FEATHER_COLORS.length - 1)],
                life: 1.0,
                decay: randomRange(0.015, 0.03),
                gravity: 0.03,
                type: 'feather',
            }));
        }
    }

    emitSparkles(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(1, 4);
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: randomRange(2, 5),
                color: COLORS.SPARKLE_COLORS[randomInt(0, COLORS.SPARKLE_COLORS.length - 1)],
                life: 1.0,
                decay: randomRange(0.02, 0.04),
                gravity: 0,
                type: 'star',
            }));
        }
    }

    emitCollect(x, y, color = '#FFD700') {
        for (let i = 0; i < 6; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(1, 3);
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: randomRange(2, 4),
                color: color,
                life: 1.0,
                decay: randomRange(0.025, 0.05),
                gravity: 0.02,
                type: 'circle',
            }));
        }
    }

    emitExplosion(x, y) {
        // Big burst on collision
        for (let i = 0; i < 15; i++) {
            const angle = randomRange(0, Math.PI * 2);
            const speed = randomRange(2, 6);
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: randomRange(3, 7),
                color: COLORS.FEATHER_COLORS[randomInt(0, COLORS.FEATHER_COLORS.length - 1)],
                life: 1.0,
                decay: randomRange(0.01, 0.025),
                gravity: 0.08,
                type: 'feather',
            }));
        }
        this.screenShake.intensity = 8;
    }

    emitTrail(x, y) {
        // Subtle trail behind hen during speed boost
        this.particles.push(new Particle(x, y, {
            vx: randomRange(-1, 0),
            vy: randomRange(-0.5, 0.5),
            size: randomRange(2, 4),
            color: COLORS.SPEED_BOOST,
            life: 0.6,
            decay: 0.04,
            gravity: 0,
            type: 'circle',
        }));
    }

    clear() {
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, decay: 0.9 };
    }
}
