// ============================================
// Aami & the Flying Hen — Themed Obstacles
// ============================================

class Obstacle {
    constructor(x, gapY, gapSize, type = 'tree', theme = 'village') {
        this.x = x;
        this.w = OBSTACLES.OBSTACLE_WIDTH;
        this.gapY = gapY;
        this.gapSize = gapSize;
        this.type = type;
        this.theme = theme;
        this.passed = false;
        this.scored = false;

        // Visual variation
        this.trunkShade = randomRange(-15, 15);
        this.leafVariation = randomRange(-10, 10);
        this.roofTint = randomInt(0, 2);
        this.rockVariant = randomInt(0, 2);
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
    }

    isOffScreen() {
        return this.x + this.w < -10;
    }

    getTopRect() {
        return { x: this.x, y: 0, w: this.w, h: this.gapY };
    }

    getBottomRect() {
        const bottomY = this.gapY + this.gapSize;
        return { x: this.x, y: bottomY, w: this.w, h: GAME.HEIGHT - GAME.GROUND_HEIGHT - bottomY };
    }

    draw(ctx) {
        if (this.theme === 'forest') {
            if (this.type === 'tree') this.drawBamboo(ctx);
            else this.drawVine(ctx);
        } else if (this.theme === 'mountain') {
            if (this.type === 'tree') this.drawRockSpire(ctx);
            else this.drawIcePillar(ctx);
        } else {
            // village (default)
            if (this.type === 'tree') this.drawTree(ctx);
            else this.drawRoof(ctx);
        }
    }

    // ========== VILLAGE OBSTACLES ==========

    drawTree(ctx) {
        const cx = this.x + this.w / 2;
        const topH = this.gapY;
        if (topH > 0) {
            const trunkW = this.w * 0.35;
            ctx.fillStyle = COLORS.TRUNK;
            ctx.fillRect(cx - trunkW / 2, 0, trunkW, topH);
            ctx.strokeStyle = COLORS.TRUNK_DARK;
            ctx.lineWidth = 1;
            for (let ty = 10; ty < topH; ty += 18) {
                ctx.beginPath();
                ctx.moveTo(cx - trunkW / 2 + 2, ty);
                ctx.lineTo(cx + trunkW / 2 - 2, ty + 4);
                ctx.stroke();
            }
            ctx.fillStyle = COLORS.LEAVES;
            ctx.beginPath();
            ctx.arc(cx, topH, this.w * 0.55 + this.leafVariation, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = COLORS.LEAVES_LIGHT;
            ctx.beginPath();
            ctx.arc(cx - 6, topH - 5, this.w * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = COLORS.LEAVES_DARK;
            ctx.beginPath();
            ctx.arc(cx + 8, topH + 5, this.w * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Coconuts
            ctx.fillStyle = '#5D4037';
            ctx.beginPath(); ctx.arc(cx - 5, topH - 2, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 6, topH, 3.5, 0, Math.PI * 2); ctx.fill();
        }

        const bottomY = this.gapY + this.gapSize;
        const bottomH = GAME.HEIGHT - GAME.GROUND_HEIGHT - bottomY;
        if (bottomH > 0) {
            const trunkW = this.w * 0.35;
            ctx.fillStyle = COLORS.TRUNK;
            ctx.fillRect(cx - trunkW / 2, bottomY, trunkW, bottomH);
            ctx.strokeStyle = COLORS.TRUNK_DARK;
            ctx.lineWidth = 1;
            for (let ty = bottomY + 15; ty < bottomY + bottomH; ty += 18) {
                ctx.beginPath();
                ctx.moveTo(cx - trunkW / 2 + 2, ty);
                ctx.lineTo(cx + trunkW / 2 - 2, ty - 4);
                ctx.stroke();
            }
            ctx.fillStyle = COLORS.LEAVES;
            ctx.beginPath();
            ctx.arc(cx, bottomY, this.w * 0.55 + this.leafVariation, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = COLORS.LEAVES_LIGHT;
            ctx.beginPath();
            ctx.arc(cx + 6, bottomY + 5, this.w * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = COLORS.LEAVES_DARK;
            ctx.beginPath();
            ctx.arc(cx - 8, bottomY - 3, this.w * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawRoof(ctx) {
        const cx = this.x + this.w / 2;
        const roofColors = [COLORS.ROOF, '#C62828', '#EF6C00'];
        const wallColors = [COLORS.WALL, '#FFFFFF', '#FFECB3'];
        const roofColor = roofColors[this.roofTint];
        const wallColor = wallColors[this.roofTint];

        const topH = this.gapY;
        if (topH > 0) {
            ctx.fillStyle = wallColor;
            ctx.fillRect(this.x, 0, this.w, topH);
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(this.x + this.w * 0.6, 0, this.w * 0.4, topH);
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 0.5;
            for (let by = 5; by < topH; by += 12) {
                ctx.beginPath();
                ctx.moveTo(this.x, by);
                ctx.lineTo(this.x + this.w, by);
                ctx.stroke();
            }
            ctx.fillStyle = roofColor;
            ctx.beginPath();
            ctx.moveTo(this.x - 10, topH);
            ctx.lineTo(cx, topH - 20);
            ctx.lineTo(this.x + this.w + 10, topH);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x - 5, topH - 5);
            ctx.lineTo(this.x + this.w + 5, topH - 5);
            ctx.stroke();
        }

        const bottomY = this.gapY + this.gapSize;
        const bottomH = GAME.HEIGHT - GAME.GROUND_HEIGHT - bottomY;
        if (bottomH > 0) {
            ctx.fillStyle = wallColor;
            ctx.fillRect(this.x, bottomY, this.w, bottomH);
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(this.x + this.w * 0.6, bottomY, this.w * 0.4, bottomH);
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 0.5;
            for (let by = bottomY + 10; by < bottomY + bottomH; by += 12) {
                ctx.beginPath();
                ctx.moveTo(this.x, by);
                ctx.lineTo(this.x + this.w, by);
                ctx.stroke();
            }
            ctx.fillStyle = roofColor;
            ctx.beginPath();
            ctx.moveTo(this.x - 10, bottomY);
            ctx.lineTo(cx, bottomY + 20);
            ctx.lineTo(this.x + this.w + 10, bottomY);
            ctx.closePath();
            ctx.fill();
            if (bottomH > 50) {
                const wx = this.x + this.w / 2 - 7;
                const wy = bottomY + 30;
                ctx.fillStyle = '#B3E5FC';
                ctx.fillRect(wx, wy, 14, 14);
                ctx.strokeStyle = '#795548';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(wx, wy, 14, 14);
                ctx.beginPath();
                ctx.moveTo(wx + 7, wy); ctx.lineTo(wx + 7, wy + 14);
                ctx.moveTo(wx, wy + 7); ctx.lineTo(wx + 14, wy + 7);
                ctx.stroke();
            }
        }
    }

    // ========== FOREST OBSTACLES ==========

    drawBamboo(ctx) {
        const cx = this.x + this.w / 2;
        const bambooColors = ['#558B2F', '#689F38', '#7CB342'];
        const segmentH = 22;

        const drawBambooStalk = (sx, startY, height, shade) => {
            const stalkW = 14;
            // Main stalk
            ctx.fillStyle = bambooColors[shade];
            ctx.fillRect(sx - stalkW / 2, startY, stalkW, height);

            // Segments (nodes)
            ctx.fillStyle = '#33691E';
            for (let y = startY; y < startY + height; y += segmentH) {
                ctx.fillRect(sx - stalkW / 2 - 2, y, stalkW + 4, 3);
            }

            // Highlight line
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(sx - 2, startY, 4, height);

            // Small leaves at nodes
            ctx.fillStyle = '#43A047';
            for (let y = startY + segmentH; y < startY + height - 10; y += segmentH * 2) {
                ctx.save();
                ctx.translate(sx + stalkW / 2, y);
                ctx.beginPath();
                ctx.ellipse(8, -3, 10, 4, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };

        // Top bamboo (growing down)
        const topH = this.gapY;
        if (topH > 0) {
            drawBambooStalk(cx - 8, 0, topH, 0);
            drawBambooStalk(cx + 8, 0, topH - 10, 1);
            // Leaf tuft at gap edge
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.arc(cx, topH, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#43A047';
            ctx.beginPath();
            ctx.arc(cx - 6, topH - 3, 12, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bottom bamboo (growing up)
        const bottomY = this.gapY + this.gapSize;
        const bottomH = GAME.HEIGHT - GAME.GROUND_HEIGHT - bottomY;
        if (bottomH > 0) {
            drawBambooStalk(cx - 8, bottomY, bottomH, 2);
            drawBambooStalk(cx + 8, bottomY + 8, bottomH - 8, 0);
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.arc(cx, bottomY, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#43A047';
            ctx.beginPath();
            ctx.arc(cx + 5, bottomY + 4, 12, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawVine(ctx) {
        const cx = this.x + this.w / 2;

        const drawThickVine = (startY, height, isTop) => {
            // Main vine trunk
            ctx.strokeStyle = '#5D4037';
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(cx, startY);
            for (let y = startY; y < startY + height; y += 20) {
                const wobble = Math.sin(y * 0.05) * 8;
                ctx.lineTo(cx + wobble, y);
            }
            ctx.stroke();

            // Inner vine
            ctx.strokeStyle = '#795548';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx, startY);
            for (let y = startY; y < startY + height; y += 20) {
                const wobble = Math.sin(y * 0.05) * 8;
                ctx.lineTo(cx + wobble, y);
            }
            ctx.stroke();

            // Leaves along vine
            ctx.fillStyle = '#388E3C';
            for (let y = startY + 15; y < startY + height - 10; y += 25) {
                const lx = cx + Math.sin(y * 0.05) * 8;
                const side = (y % 50 < 25) ? -1 : 1;
                ctx.save();
                ctx.translate(lx + side * 8, y);
                ctx.rotate(side * 0.4);
                ctx.beginPath();
                ctx.ellipse(side * 8, 0, 12, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Thorns / berries
            ctx.fillStyle = '#E53935';
            for (let y = startY + 30; y < startY + height - 20; y += 40) {
                const bx = cx + Math.sin(y * 0.05) * 8 + (y % 50 < 25 ? -12 : 12);
                ctx.beginPath();
                ctx.arc(bx, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const topH = this.gapY;
        if (topH > 0) {
            drawThickVine(0, topH, true);
            // Dangling tip
            ctx.fillStyle = '#2E7D32';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(cx - 10 + i * 10, topH, 8, 12, 0.2 * (i - 1), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const bottomY = this.gapY + this.gapSize;
        const bottomH = GAME.HEIGHT - GAME.GROUND_HEIGHT - bottomY;
        if (bottomH > 0) {
            drawThickVine(bottomY, bottomH, false);
            ctx.fillStyle = '#2E7D32';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.ellipse(cx - 10 + i * 10, bottomY, 8, 12, 0.2 * (i - 1), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // ========== MOUNTAIN OBSTACLES ==========

    drawRockSpire(ctx) {
        const cx = this.x + this.w / 2;
        const rockFaces = ['#546E7A', '#607D8B', '#78909C'];
        const rockDark = ['#37474F', '#455A64', '#546E7A'];

        const drawSpire = (baseX, baseY, height, isDown) => {
            const baseW = this.w * 0.85;
            const tipY = isDown ? baseY + height : baseY - height;

            // Main rock face
            ctx.fillStyle = rockFaces[this.rockVariant];
            ctx.beginPath();
            ctx.moveTo(baseX - baseW / 2, baseY);
            ctx.lineTo(baseX - baseW * 0.08, tipY);
            ctx.lineTo(baseX + baseW * 0.12, tipY + (isDown ? -8 : 8));
            ctx.lineTo(baseX + baseW / 2, baseY);
            ctx.closePath();
            ctx.fill();

            // Dark face
            ctx.fillStyle = rockDark[this.rockVariant];
            ctx.beginPath();
            ctx.moveTo(baseX + baseW * 0.05, tipY + (isDown ? -3 : 3));
            ctx.lineTo(baseX + baseW / 2, baseY);
            ctx.lineTo(baseX + baseW * 0.15, baseY);
            ctx.closePath();
            ctx.fill();

            // Cracks / texture
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            const mid = (baseY + tipY) / 2;
            ctx.beginPath();
            ctx.moveTo(baseX - 5, mid);
            ctx.lineTo(baseX + 3, mid + (isDown ? -20 : 20));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(baseX + 8, mid + (isDown ? 15 : -15));
            ctx.lineTo(baseX + 2, mid + (isDown ? -10 : 10));
            ctx.stroke();

            // Snow patches
            if (height > 60) {
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                const snowY = isDown ? baseY + height * 0.7 : baseY - height * 0.7;
                ctx.beginPath();
                ctx.ellipse(baseX - 5, snowY, 12, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const topH = this.gapY;
        if (topH > 0) drawSpire(cx, 0, topH, true);

        const bottomY = this.gapY + this.gapSize;
        const bottomH = GAME.HEIGHT - GAME.GROUND_HEIGHT - bottomY;
        if (bottomH > 0) drawSpire(cx, GAME.HEIGHT - GAME.GROUND_HEIGHT, bottomH, false);
    }

    drawIcePillar(ctx) {
        const cx = this.x + this.w / 2;
        const iceColors = ['#B3E5FC', '#81D4FA', '#4FC3F7'];
        const iceDark = ['#039BE5', '#0288D1', '#0277BD'];

        const drawPillar = (startY, height) => {
            const pillarW = this.w * 0.5;

            // Main ice body
            const grad = ctx.createLinearGradient(cx - pillarW / 2, 0, cx + pillarW / 2, 0);
            grad.addColorStop(0, iceColors[this.rockVariant]);
            grad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
            grad.addColorStop(1, iceDark[this.rockVariant]);
            ctx.fillStyle = grad;
            ctx.fillRect(cx - pillarW / 2, startY, pillarW, height);

            // Icicle edge details
            ctx.fillStyle = iceColors[this.rockVariant];
            for (let i = 0; i < 4; i++) {
                const ix = cx - pillarW / 2 + i * (pillarW / 3);
                const icicleH = randomRange(8, 18);
                ctx.beginPath();
                ctx.moveTo(ix - 3, startY + height);
                ctx.lineTo(ix, startY + height + icicleH);
                ctx.lineTo(ix + 3, startY + height);
                ctx.closePath();
                ctx.fill();
            }

            // Top icicles (hanging)
            for (let i = 0; i < 3; i++) {
                const ix = cx - pillarW / 2 + 5 + i * (pillarW / 2.5);
                const icicleH = randomRange(6, 14);
                ctx.beginPath();
                ctx.moveTo(ix - 2, startY);
                ctx.lineTo(ix, startY - icicleH);
                ctx.lineTo(ix + 2, startY);
                ctx.closePath();
                ctx.fill();
            }

            // Shine streak
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(cx - 2, startY, 4, height);

            // Frost texture
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            for (let y = startY + 20; y < startY + height - 10; y += 30) {
                ctx.beginPath();
                ctx.arc(cx + randomRange(-8, 8), y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const topH = this.gapY;
        if (topH > 0) drawPillar(0, topH);

        const bottomY = this.gapY + this.gapSize;
        const bottomH = GAME.HEIGHT - GAME.GROUND_HEIGHT - bottomY;
        if (bottomH > 0) drawPillar(bottomY, bottomH);
    }
}

class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.gapSize = OBSTACLES.GAP_SIZE;
        this.spawnInterval = OBSTACLES.SPAWN_INTERVAL;
        this.totalSpawned = 0;
        this.stopSpawning = false;
        this.theme = 'village';
    }

    setTheme(themeName) {
        this.theme = themeName;
    }

    update(scrollSpeed, now) {
        if (!this.stopSpawning && now - this.lastSpawnTime > this.spawnInterval) {
            this.spawn();
            this.lastSpawnTime = now;
        }
        for (const obs of this.obstacles) {
            obs.update(scrollSpeed);
        }
        this.obstacles = this.obstacles.filter(o => !o.isOffScreen());
        this.gapSize = Math.max(OBSTACLES.MIN_GAP_SIZE, this.gapSize - OBSTACLES.GAP_SHRINK_RATE * 0.016);
        this.spawnInterval = Math.max(OBSTACLES.MIN_SPAWN_INTERVAL, this.spawnInterval - 0.05);
    }

    spawn() {
        const minTop = OBSTACLES.MIN_TOP;
        const maxGapY = (GAME.HEIGHT - GAME.GROUND_HEIGHT) * OBSTACLES.MAX_TOP_RATIO;
        const gapY = randomRange(minTop, maxGapY);
        const type = Math.random() > 0.5 ? 'tree' : 'roof';

        this.obstacles.push(new Obstacle(GAME.WIDTH + 10, gapY, this.gapSize, type, this.theme));
        this.totalSpawned++;
    }

    draw(ctx) {
        for (const obs of this.obstacles) {
            obs.draw(ctx);
        }
    }

    reset() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.gapSize = OBSTACLES.GAP_SIZE;
        this.spawnInterval = OBSTACLES.SPAWN_INTERVAL;
        this.totalSpawned = 0;
        this.stopSpawning = false;
    }
}
