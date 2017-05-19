"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vox_1 = require("./vox");
const THREE = require("three");
class Weapon extends vox_1.default {
    constructor(data) {
        super(data);
        this.ammo = new vox_1.default(this.data.ammo);
        this.spawned = [];
        this.clock = new THREE.Clock();
        this.tick();
    }
    fire() {
        const shell = new THREE.Object3D();
        shell.copy(this.ammo);
        shell.position.copy(this.parent.position);
        shell.rotation.copy(this.parent.rotation);
        shell.position.y += (Math.random() - 0.5) * this.data.ammo.spread;
        this.spawned.push(shell);
        window.scene.add(shell);
    }
    tick() {
        const delta = this.clock.getDelta();
        this.spawned.forEach(shell => {
            shell.translateZ(this.data.ammo.speed * delta);
        });
        requestAnimationFrame(this.tick.bind(this));
    }
}
exports.default = Weapon;
