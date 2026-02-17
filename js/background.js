// ============================================
// Aami & the Flying Hen — Themed Parallax Background
// ============================================

class Background {
    constructor() {
        this.theme = THEME_PRESETS.village; // default
        this.clouds = [];
        this.elements = []; // houses, trees, or peaks
        this.flowers = [];
        this.cloudTimer = 0;
        this.timeOfDay = 0;

        this.initClouds();
        this.initElements();
        this.initFlowers();
    }

    setTheme(themeName) {
        this.theme = THEME_PRESETS[themeName] || THEME_PRESETS.village;
        this.elements = [];
        this.flowers = [];
        this.initElements();
        this.initFlowers();
    }

    initClouds() {
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            this.clouds.push({
                x: randomRange(0, GAME.WIDTH),
                y: randomRange(20, 150),
                w: randomRange(60, 140),
                h: randomRange(25, 50),
                speed: randomRange(0.2, 0.5),
                opacity: randomRange(0.5, 0.9),
            });
        }
    }

    initElements() {
        this.elements = [];
        const type = this.theme.elements;
        for (let i = 0; i < 5; i++) {
            if (type === 'houses') {
                this.elements.push({
                    x: i * 200 + randomRange(-20, 20),
                    w: randomRange(40, 70),
                    h: randomRange(40, 65),
                    roofColor: ['#D84315', '#C62828', '#6D4C41', '#795548'][randomInt(0, 3)],
                    wallColor: ['#FFF9C4', '#FFFFFF', '#FFECB3', '#E8F5E9'][randomInt(0, 3)],
                    hasWindow: Math.random() > 0.3,
                    hasDoor: Math.random() > 0.4,
                });
            } else if (type === 'trees') {
                this.elements.push({
                    x: i * 180 + randomRange(-30, 30),
                    trunkH: randomRange(50, 90),
                    trunkW: randomRange(8, 14),
                    canopyR: randomRange(25, 45),
                    shade: randomInt(0, 2), // color variation
                });
            } else if (type === 'peaks') {
                this.elements.push({
                    x: i * 190 + randomRange(-25, 25),
                    peakH: randomRange(80, 140),
                    baseW: randomRange(80, 140),
                    snowLine: randomRange(0.3, 0.5),
                    shade: randomInt(0, 2),
                });
            }
        }
    }

    initFlowers() {
        this.flowers = [];
        const colors = this.theme.flowerColors;
        const count = this.theme.elements === 'peaks' ? 8 : 20;
        for (let i = 0; i < count; i++) {
            this.flowers.push({
                x: randomRange(0, GAME.WIDTH * 2),
                color: colors[randomInt(0, colors.length - 1)],
                size: randomRange(3, 6),
                stemH: randomRange(8, 18),
            });
        }
    }

    update(scrollSpeed) {
        // Move clouds
        for (const cloud of this.clouds) {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.w < -20) {
                cloud.x = GAME.WIDTH + randomRange(10, 100);
                cloud.y = randomRange(20, 150);
                cloud.w = randomRange(60, 140);
            }
        }

        // Move elements (mid layer, slower)
        for (const el of this.elements) {
            el.x -= scrollSpeed * 0.4;
            const w = el.w || el.baseW || 60;
            if (el.x + w < -60) {
                el.x = GAME.WIDTH + randomRange(50, 150);
            }
        }

        // Move flowers (near ground, faster)
        for (const flower of this.flowers) {
            flower.x -= scrollSpeed * 0.8;
            if (flower.x < -10) {
                flower.x = GAME.WIDTH + randomRange(5, 40);
            }
        }

        // Slowly cycle time of day
        this.timeOfDay = (this.timeOfDay + 0.00002) % 1;
    }

    draw(ctx) {
        this.drawSky(ctx);
        this.drawClouds(ctx);
        this.drawHills(ctx);
        this.drawElements(ctx);
        this.drawGround(ctx);
        this.drawFlowers(ctx);
    }

    drawSky(ctx) {
        const th = this.theme;
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME.HEIGHT - GAME.GROUND_HEIGHT);
        const t = Math.sin(this.timeOfDay * Math.PI * 2);
        const sunsetAmount = Math.max(0, t);

        const topR = lerp(th.skyTop[0], th.sunsetTop[0], sunsetAmount * 0.5);
        const topG = lerp(th.skyTop[1], th.sunsetTop[1], sunsetAmount * 0.5);
        const topB = lerp(th.skyTop[2], th.sunsetTop[2], sunsetAmount * 0.3);
        const bottomR = lerp(th.skyBottom[0], th.sunsetBottom[0], sunsetAmount * 0.3);
        const bottomG = lerp(th.skyBottom[1], th.sunsetBottom[1], sunsetAmount * 0.5);
        const bottomB = lerp(th.skyBottom[2], th.sunsetBottom[2], sunsetAmount * 0.5);

        gradient.addColorStop(0, `rgb(${topR},${topG},${topB})`);
        gradient.addColorStop(1, `rgb(${bottomR},${bottomG},${bottomB})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT - GAME.GROUND_HEIGHT);

        // Sun / glow
        const sunY = 60 + sunsetAmount * 30;
        ctx.save();
        ctx.globalAlpha = 0.3;
        const sunGrad = ctx.createRadialGradient(650, sunY, 5, 650, sunY, 60);
        sunGrad.addColorStop(0, '#FFF9C4');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(590, sunY - 60, 120, 120);
        ctx.restore();
    }

    drawClouds(ctx) {
        for (const cloud of this.clouds) {
            ctx.save();
            ctx.globalAlpha = cloud.opacity;
            ctx.fillStyle = '#FFFFFF';
            const cx = cloud.x + cloud.w / 2;
            const cy = cloud.y + cloud.h / 2;

            ctx.beginPath();
            ctx.arc(cx - cloud.w * 0.25, cy, cloud.h * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy - cloud.h * 0.15, cloud.h * 0.55, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + cloud.w * 0.22, cy, cloud.h * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx - cloud.w * 0.1, cy + cloud.h * 0.1, cloud.h * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + cloud.w * 0.1, cy + cloud.h * 0.1, cloud.h * 0.38, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    drawHills(ctx) {
        const groundTop = GAME.HEIGHT - GAME.GROUND_HEIGHT;
        const th = this.theme;

        // Far hills
        ctx.fillStyle = th.farHill;
        ctx.beginPath();
        ctx.moveTo(0, groundTop);
        for (let x = 0; x <= GAME.WIDTH; x += 5) {
            const hillH = th.elements === 'peaks' ? 70 : 50;
            const y = groundTop - hillH - Math.sin(x * 0.008 + 1) * 30 - Math.sin(x * 0.015) * 15;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(GAME.WIDTH, groundTop);
        ctx.closePath();
        ctx.fill();

        // Near hills
        ctx.fillStyle = th.nearHill;
        ctx.beginPath();
        ctx.moveTo(0, groundTop);
        for (let x = 0; x <= GAME.WIDTH; x += 5) {
            const hillH = th.elements === 'peaks' ? 40 : 25;
            const y = groundTop - hillH - Math.sin(x * 0.012 + 2) * 20 - Math.sin(x * 0.02 + 1) * 10;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(GAME.WIDTH, groundTop);
        ctx.closePath();
        ctx.fill();
    }

    drawElements(ctx) {
        const type = this.theme.elements;
        if (type === 'houses') this.drawHouses(ctx);
        else if (type === 'trees') this.drawForestTrees(ctx);
        else if (type === 'peaks') this.drawMountainPeaks(ctx);
    }

    // === VILLAGE: houses ===
    drawHouses(ctx) {
        const groundTop = GAME.HEIGHT - GAME.GROUND_HEIGHT;
        for (const house of this.elements) {
            if (house.x > GAME.WIDTH + 50 || house.x + house.w < -50) continue;
            const hx = house.x;
            const hy = groundTop - house.h - 15;

            ctx.fillStyle = house.wallColor;
            ctx.fillRect(hx, hy, house.w, house.h);
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(hx + house.w * 0.6, hy, house.w * 0.4, house.h);

            // Bricks
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 0.5;
            for (let by = hy + 5; by < hy + house.h; by += 12) {
                ctx.beginPath();
                ctx.moveTo(hx, by);
                ctx.lineTo(hx + house.w, by);
                ctx.stroke();
            }

            // Roof
            ctx.fillStyle = house.roofColor;
            ctx.beginPath();
            ctx.moveTo(hx - 8, hy);
            ctx.lineTo(hx + house.w / 2, hy - 25);
            ctx.lineTo(hx + house.w + 8, hy);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const ry = hy - 5 - i * 5;
                const offset = (25 - i * 5) * (house.w + 16) / 50;
                ctx.beginPath();
                ctx.moveTo(hx + house.w / 2 - offset, ry);
                ctx.lineTo(hx + house.w / 2 + offset, ry);
                ctx.stroke();
            }

            // Window
            if (house.hasWindow) {
                const wx = hx + house.w * 0.6;
                const wy = hy + 10;
                ctx.fillStyle = '#B3E5FC';
                ctx.fillRect(wx, wy, 12, 12);
                ctx.strokeStyle = '#795548';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(wx, wy, 12, 12);
                ctx.beginPath();
                ctx.moveTo(wx + 6, wy);
                ctx.lineTo(wx + 6, wy + 12);
                ctx.moveTo(wx, wy + 6);
                ctx.lineTo(wx + 12, wy + 6);
                ctx.stroke();
            }

            // Door
            if (house.hasDoor) {
                const dx = hx + house.w * 0.2;
                const dh = house.h * 0.5;
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(dx, hy + house.h - dh, 14, dh);
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(dx + 11, hy + house.h - dh / 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // === FOREST: tall background trees ===
    drawForestTrees(ctx) {
        const groundTop = GAME.HEIGHT - GAME.GROUND_HEIGHT;
        const trunkColors = ['#4E342E', '#5D4037', '#3E2723'];
        const canopyColors = ['#1B5E20', '#2E7D32', '#33691E'];
        const canopyLight = ['#388E3C', '#43A047', '#558B2F'];

        for (const tree of this.elements) {
            if (tree.x > GAME.WIDTH + 60 || tree.x < -60) continue;
            const tx = tree.x;
            const baseY = groundTop - 15;

            // Trunk
            ctx.fillStyle = trunkColors[tree.shade];
            ctx.fillRect(tx - tree.trunkW / 2, baseY - tree.trunkH, tree.trunkW, tree.trunkH);

            // Trunk texture lines
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 0.8;
            for (let y = baseY - tree.trunkH + 8; y < baseY; y += 12) {
                ctx.beginPath();
                ctx.moveTo(tx - tree.trunkW / 2 + 1, y);
                ctx.lineTo(tx + tree.trunkW / 2 - 1, y + 3);
                ctx.stroke();
            }

            // Canopy layers (bottom to top)
            const canopyY = baseY - tree.trunkH;
            ctx.fillStyle = canopyColors[tree.shade];
            ctx.beginPath();
            ctx.arc(tx, canopyY - 5, tree.canopyR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = canopyLight[tree.shade];
            ctx.beginPath();
            ctx.arc(tx - 8, canopyY - 15, tree.canopyR * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = canopyColors[tree.shade];
            ctx.beginPath();
            ctx.arc(tx + 6, canopyY - 20, tree.canopyR * 0.55, 0, Math.PI * 2);
            ctx.fill();

            // Hanging vines (forest feel)
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 1.2;
            for (let v = 0; v < 3; v++) {
                const vx = tx - 12 + v * 12;
                const vLen = randomRange(15, 30);
                ctx.beginPath();
                ctx.moveTo(vx, canopyY + tree.canopyR * 0.4);
                ctx.quadraticCurveTo(vx + 5, canopyY + vLen / 2, vx - 2, canopyY + vLen);
                ctx.stroke();
            }
        }
    }

    // === MOUNTAIN: rocky peaks in background ===
    drawMountainPeaks(ctx) {
        const groundTop = GAME.HEIGHT - GAME.GROUND_HEIGHT;
        const rockColors = ['#607D8B', '#78909C', '#546E7A'];
        const snowColors = ['#ECEFF1', '#F5F5F5', '#E0E0E0'];

        for (const peak of this.elements) {
            if (peak.x > GAME.WIDTH + 80 || peak.x + peak.baseW < -80) continue;
            const px = peak.x;
            const baseY = groundTop - 10;
            const topY = baseY - peak.peakH;

            // Rock face
            ctx.fillStyle = rockColors[peak.shade];
            ctx.beginPath();
            ctx.moveTo(px, baseY);
            ctx.lineTo(px + peak.baseW * 0.45, topY);
            ctx.lineTo(px + peak.baseW * 0.55, topY + 5);
            ctx.lineTo(px + peak.baseW, baseY);
            ctx.closePath();
            ctx.fill();

            // Dark face (shading)
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.moveTo(px + peak.baseW * 0.5, topY + 3);
            ctx.lineTo(px + peak.baseW, baseY);
            ctx.lineTo(px + peak.baseW * 0.7, baseY);
            ctx.closePath();
            ctx.fill();

            // Snow cap
            const snowY = topY + peak.peakH * peak.snowLine;
            ctx.fillStyle = snowColors[peak.shade];
            ctx.beginPath();
            ctx.moveTo(px + peak.baseW * 0.25, snowY);
            ctx.lineTo(px + peak.baseW * 0.45, topY);
            ctx.lineTo(px + peak.baseW * 0.55, topY + 5);
            ctx.lineTo(px + peak.baseW * 0.75, snowY + 8);
            // Jagged snow edge
            ctx.lineTo(px + peak.baseW * 0.65, snowY + 3);
            ctx.lineTo(px + peak.baseW * 0.55, snowY + 10);
            ctx.lineTo(px + peak.baseW * 0.45, snowY + 2);
            ctx.lineTo(px + peak.baseW * 0.35, snowY + 8);
            ctx.closePath();
            ctx.fill();

            // Rock texture cracks
            ctx.strokeStyle = 'rgba(0,0,0,0.12)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(px + peak.baseW * 0.4, topY + peak.peakH * 0.3);
            ctx.lineTo(px + peak.baseW * 0.35, topY + peak.peakH * 0.6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px + peak.baseW * 0.6, topY + peak.peakH * 0.4);
            ctx.lineTo(px + peak.baseW * 0.65, topY + peak.peakH * 0.7);
            ctx.stroke();
        }
    }

    drawGround(ctx) {
        const groundTop = GAME.HEIGHT - GAME.GROUND_HEIGHT;
        const th = this.theme;

        // Grass top
        ctx.fillStyle = th.ground;
        ctx.fillRect(0, groundTop, GAME.WIDTH, 8);

        // Grass blades or snow/rock details
        ctx.fillStyle = th.groundDark;
        if (th.elements !== 'peaks') {
            // Grass blades for village & forest
            for (let x = 0; x < GAME.WIDTH; x += 8) {
                ctx.beginPath();
                ctx.moveTo(x, groundTop);
                ctx.lineTo(x + 2, groundTop - 5 - Math.random() * 4);
                ctx.lineTo(x + 4, groundTop);
                ctx.fill();
            }
        } else {
            // Rocky pebbles for mountain
            for (let x = 0; x < GAME.WIDTH; x += 15) {
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.ellipse(x + 5, groundTop + 3, 4, 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Dirt layer
        const gradient = ctx.createLinearGradient(0, groundTop + 8, 0, GAME.HEIGHT);
        gradient.addColorStop(0, th.dirtTop);
        gradient.addColorStop(0.3, th.dirtBottom);
        gradient.addColorStop(1, th.dirtBottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, groundTop + 8, GAME.WIDTH, GAME.GROUND_HEIGHT - 8);

        // Ground texture dots
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        for (let i = 0; i < 30; i++) {
            const gx = (i * 29 + 7) % GAME.WIDTH;
            const gy = groundTop + 15 + (i * 17 + 3) % (GAME.GROUND_HEIGHT - 20);
            ctx.beginPath();
            ctx.arc(gx, gy, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFlowers(ctx) {
        const groundTop = GAME.HEIGHT - GAME.GROUND_HEIGHT;
        const isSnowy = this.theme.elements === 'peaks';

        for (const flower of this.flowers) {
            if (flower.x < -10 || flower.x > GAME.WIDTH + 10) continue;
            const fx = flower.x;
            const fy = groundTop - 2;

            if (isSnowy) {
                // Small ice crystals instead of flowers
                ctx.fillStyle = flower.color;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(fx, fy - flower.stemH);
                ctx.lineTo(fx - 3, fy - flower.stemH + 5);
                ctx.lineTo(fx + 3, fy - flower.stemH + 5);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1;
            } else {
                // Stem
                ctx.strokeStyle = '#388E3C';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(fx, fy);
                ctx.lineTo(fx, fy - flower.stemH);
                ctx.stroke();

                // Petals
                ctx.fillStyle = flower.color;
                ctx.beginPath();
                ctx.arc(fx, fy - flower.stemH, flower.size, 0, Math.PI * 2);
                ctx.fill();

                // Center
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(fx, fy - flower.stemH, flower.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    reset() {
        this.clouds = [];
        this.elements = [];
        this.flowers = [];
        this.initClouds();
        this.initElements();
        this.initFlowers();
    }
}
