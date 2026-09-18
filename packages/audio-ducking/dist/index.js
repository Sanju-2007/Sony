"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioDuckingController = exports.DEFAULT_DUCKING_CONFIG = void 0;
exports.DEFAULT_DUCKING_CONFIG = {
    duckedVolume: 0.40, // Reduce to 40% during voice activity
    normalVolume: 1.00, // Full 100% volume
    attackTimeMs: 150, // Quick 150ms ease down
    holdTimeMs: 800, // 800ms hold time to avoid volume pumping between words
    releaseTimeMs: 500, // Smooth 500ms fade back to normal
};
/**
 * Robust Audio Ducking State Machine designed for "Sing Together" & Live Voice Rooms.
 * Decouples speech detection from abrupt volume drops using exponential attack and linear release.
 */
class AudioDuckingController {
    config;
    state = 'IDLE';
    currentVolume;
    targetVolume;
    isVoicePresent = false;
    lastVoiceTimestamp = 0;
    transitionStartTime = 0;
    transitionStartVolume = 1.0;
    activeTimer = null;
    listeners = new Set();
    constructor(config = {}) {
        this.config = { ...exports.DEFAULT_DUCKING_CONFIG, ...config };
        this.currentVolume = this.config.normalVolume;
        this.targetVolume = this.config.normalVolume;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        listener(this.currentVolume, this.state);
        return () => this.listeners.delete(listener);
    }
    getState() {
        return this.state;
    }
    getVolume() {
        return this.currentVolume;
    }
    /**
     * Called when voice activity detection (VAD) triggers locally or from remote participants
     */
    onVoiceActivity(isSpeaking, nowMs = Date.now()) {
        if (isSpeaking) {
            this.isVoicePresent = true;
            this.lastVoiceTimestamp = nowMs;
            if (this.state === 'IDLE' || this.state === 'RESTORING' || this.state === 'VOICE_ENDED') {
                this.transitionTo('DUCKING', this.config.duckedVolume, nowMs);
            }
        }
        else {
            this.isVoicePresent = false;
            this.lastVoiceTimestamp = nowMs;
            // If voice is active or ducking, wait for holdTimeMs before restoring to prevent pumping
            if (this.state === 'VOICE_ACTIVE' || this.state === 'DUCKING') {
                this.scheduleHoldTimeout();
            }
        }
    }
    /**
     * Periodic or frame-by-frame tick (e.g. called in requestAnimationFrame or 16ms interval)
     */
    tick(nowMs = Date.now()) {
        // Check if hold time expired while voice ended
        if (!this.isVoicePresent &&
            (this.state === 'VOICE_ACTIVE' || this.state === 'DUCKING') &&
            nowMs - this.lastVoiceTimestamp >= this.config.holdTimeMs) {
            this.transitionTo('RESTORING', this.config.normalVolume, nowMs);
        }
        // Interpolate volume if transitioning
        if (this.state === 'DUCKING') {
            const elapsed = nowMs - this.transitionStartTime;
            const progress = Math.min(1.0, elapsed / Math.max(1, this.config.attackTimeMs));
            // Ease-out curve for fast yet smooth reduction
            const eased = 1 - Math.pow(1 - progress, 2);
            this.currentVolume = this.transitionStartVolume + (this.targetVolume - this.transitionStartVolume) * eased;
            if (progress >= 1.0) {
                this.currentVolume = this.config.duckedVolume;
                this.state = 'VOICE_ACTIVE';
            }
            this.notifyListeners();
        }
        else if (this.state === 'RESTORING') {
            const elapsed = nowMs - this.transitionStartTime;
            const progress = Math.min(1.0, elapsed / Math.max(1, this.config.releaseTimeMs));
            // Linear or smooth ease-in-out restore
            this.currentVolume = this.transitionStartVolume + (this.targetVolume - this.transitionStartVolume) * progress;
            if (progress >= 1.0) {
                this.currentVolume = this.config.normalVolume;
                this.state = 'IDLE';
            }
            this.notifyListeners();
        }
        return this.currentVolume;
    }
    transitionTo(newState, targetVol, nowMs) {
        if (this.activeTimer) {
            clearTimeout(this.activeTimer);
            this.activeTimer = null;
        }
        this.state = newState;
        this.targetVolume = targetVol;
        this.transitionStartTime = nowMs;
        this.transitionStartVolume = this.currentVolume;
        this.notifyListeners();
    }
    scheduleHoldTimeout() {
        if (this.activeTimer) {
            clearTimeout(this.activeTimer);
        }
        this.activeTimer = setTimeout(() => {
            if (!this.isVoicePresent) {
                this.transitionTo('RESTORING', this.config.normalVolume, Date.now());
            }
        }, this.config.holdTimeMs);
    }
    notifyListeners() {
        for (const listener of this.listeners) {
            listener(this.currentVolume, this.state);
        }
    }
    dispose() {
        if (this.activeTimer) {
            clearTimeout(this.activeTimer);
            this.activeTimer = null;
        }
        this.listeners.clear();
    }
}
exports.AudioDuckingController = AudioDuckingController;
//# sourceMappingURL=index.js.map