// ============================================
// Aami & the Flying Hen — Audio Manager
// ============================================

class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.muted = false;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicOsc = null;
        this.musicPlaying = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.15;
            this.musicGain.connect(this.ctx.destination);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.3;
            this.sfxGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available');
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.musicGain) this.musicGain.gain.value = this.muted ? 0 : 0.15;
        if (this.sfxGain) this.sfxGain.gain.value = this.muted ? 0 : 0.3;
    }

    playNote(freq, duration, type = 'sine', gainNode = null) {
        if (!this.initialized || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(gainNode || this.sfxGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // --- Sound Effects ---

    playFlap() {
        if (!this.initialized) return;
        // Quick chirp-like sound
        this.playNote(600, 0.08, 'sine');
        setTimeout(() => this.playNote(800, 0.06, 'sine'), 30);
    }

    playCoin() {
        if (!this.initialized) return;
        this.playNote(880, 0.1, 'sine');
        setTimeout(() => this.playNote(1320, 0.15, 'sine'), 60);
    }

    playEgg() {
        if (!this.initialized) return;
        // Magical ascending arpeggio
        this.playNote(523, 0.1, 'sine');
        setTimeout(() => this.playNote(659, 0.1, 'sine'), 80);
        setTimeout(() => this.playNote(784, 0.1, 'sine'), 160);
        setTimeout(() => this.playNote(1047, 0.15, 'sine'), 240);
    }

    playPowerUp() {
        if (!this.initialized) return;
        // Sweeping upward
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.4);
    }

    playHit() {
        if (!this.initialized) return;
        // Low thud + noise
        this.playNote(100, 0.3, 'sawtooth');
        this.playNote(60, 0.2, 'square');
    }

    playScore() {
        if (!this.initialized) return;
        this.playNote(660, 0.08, 'square');
    }

    // --- Background Music ---

    startMusic() {
        if (!this.initialized || this.musicPlaying) return;
        this.musicPlaying = true;
        this._playMusicLoop();
    }

    _playMusicLoop() {
        if (!this.musicPlaying) return;

        // Simple happy melody loop
        const melody = [
            { note: 523, dur: 0.2 },  // C
            { note: 587, dur: 0.2 },  // D
            { note: 659, dur: 0.2 },  // E
            { note: 523, dur: 0.2 },  // C
            { note: 659, dur: 0.2 },  // E
            { note: 698, dur: 0.2 },  // F
            { note: 784, dur: 0.4 },  // G
            { note: 784, dur: 0.2 },  // G
            { note: 698, dur: 0.2 },  // F
            { note: 659, dur: 0.2 },  // E
            { note: 587, dur: 0.2 },  // D
            { note: 523, dur: 0.2 },  // C
            { note: 587, dur: 0.2 },  // D
            { note: 523, dur: 0.4 },  // C
            { note: 0, dur: 0.2 },    // rest
        ];

        let time = 0;
        for (const m of melody) {
            if (m.note > 0) {
                setTimeout(() => {
                    if (this.musicPlaying) {
                        this.playNote(m.note, m.dur * 0.9, 'sine', this.musicGain);
                    }
                }, time * 1000);
            }
            time += m.dur;
        }

        // Loop
        setTimeout(() => {
            if (this.musicPlaying) this._playMusicLoop();
        }, time * 1000);
    }

    stopMusic() {
        this.musicPlaying = false;
    }
}
