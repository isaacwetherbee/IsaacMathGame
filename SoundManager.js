class SoundManager {
    constructor() {
        this.sounds = {}; // Store sound instances
    }

    // Load a sound
    load(name, path) {
        this.sounds[name] = path; // just store path
    }

    // Play a sound (overlapping allowed)
    play(name) {
        if (!this.sounds[name]) {
            console.warn(`Sound "${name}" not loaded`);
            return;
        }

        // Create a new audio instance for overlapping
        const audio = new Audio(this.sounds[name]);
        audio.preload = "auto";
        audio.play().catch(e => {
            console.warn("Audio playback failed:", e);
        });
    }
}
