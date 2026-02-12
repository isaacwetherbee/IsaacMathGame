class Sound {
    constructor(path) {
        this.audio = new Audio(path);  // Load the audio file
        this.audio.preload = "auto";
    }

    play() {
        // Stop if currently playing
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.play().catch(e => {
            console.warn("Audio playback failed:", e);
        });
    }
}
