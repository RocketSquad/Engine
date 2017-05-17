"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var howler_1 = require("howler");
var Sound = (function () {
    function Sound(path) {
        var _this = this;
        this.sfx = new howler_1.Howl({
            src: [path],
            onend: function () {
                _this.playing = false;
            },
        });
        this.playing = false;
    }
    Sound.prototype.play = function () {
        if (!this.playing) {
            this.playing = true;
            this.sfx.play();
        }
    };
    Sound.prototype.stop = function () {
        if (this.playing) {
            this.sfx.stop();
        }
    };
    return Sound;
}());
exports.default = Sound;
//# sourceMappingURL=sound.js.map