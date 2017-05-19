"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vox_1 = require("./vox");
const THREE = require("three");
const rand = () => {
    return Math.random() - 0.5;
};
class Ai extends vox_1.default {
    constructor(data) {
        super(data);
        this.clock = new THREE.Clock();
        this.newTarget();
        this.tick();
    }
    newTarget() {
        this.lerp = 0;
        this.target = new THREE.Vector3(rand() * this.data.distance, 0, rand() * this.data.distance);
    }
    tick() {
        const delta = this.clock.getDelta();
        this.lerp += delta * this.data.speed;
        this.position.lerp(this.target, this.lerp);
        this.lookAt(this.target);
        if (this.lerp >= 1) {
            this.newTarget();
        }
        requestAnimationFrame(this.tick.bind(this));
    }
}
exports.default = Ai;
