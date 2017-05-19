"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const howler_1 = require("howler");
class Sound {
    constructor(path) {
        this.sfx = new howler_1.Howl({
            src: [path],
            onend: () => {
                this.playing = false;
            },
        });
        this.playing = false;
    }
    play() {
        if (!this.playing) {
            this.playing = true;
            this.sfx.play();
        }
    }
    stop() {
        if (this.playing) {
            this.sfx.stop();
        }
    }
}
exports.default = Sound;
