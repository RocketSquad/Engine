"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const input_1 = require("../../engine/input");
const assets_1 = require("../../engine/assets");
let data = {
    turnSpeed: 1,
    forwardSpeed: 1,
    cameraLerp: 1,
    cameraOffset: [0, 5, 5],
    cameraLookAt: [0, 0, 0]
};
assets_1.Watch('content/controller/character.toml', (newData) => {
    console.log('got', newData);
    data = newData;
});
class CharacterController {
    constructor(target) {
        this.target = target;
        this.tick = this.tick.bind(this);
        this.setup();
    }
    async setup() {
        this.clock = new THREE.Clock();
        this.target.position.set(0, 0, -5);
        this.tick();
    }
    tick() {
        const delta = this.clock.getDelta();
        let forward = 0;
        let turn = 0;
        let up = 0;
        requestAnimationFrame(this.tick);
        if (input_1.keys.w)
            forward = 1;
        if (input_1.keys.s)
            forward = -1;
        if (input_1.keys.d)
            turn = -1;
        if (input_1.keys.a)
            turn = 1;
        if (input_1.keys.x)
            up = 1;
        if (input_1.keys.c)
            up = -1;
        this.target.rotateY(turn * delta * data.turnSpeed);
        this.target.translateZ(forward * delta * data.forwardSpeed);
        this.target.translateY(up * delta * data.forwardSpeed);
        const walking = forward !== 0 || turn !== 0;
        /*
        if (walking && this.target.current !== 'walk') {
            this.target.play('walk');
        } else if (!walking && this.target.current !== 'idle') {
            this.target.play('idle');
        }*/
        if (window.camera) {
            const cam = window.camera;
            const axis = new THREE.Vector3().fromArray(data.cameraLookAt);
            // axis.applyQuaternion(this.target.quaternion);
            const dstPosition = this.target.position.clone().add(axis);
            const camPosition = this.target.position.clone().add(new THREE.Vector3().fromArray(data.cameraOffset));
            cam.position.lerp(camPosition, data.cameraLerp);
            cam.lookAt(dstPosition);
        }
    }
}
exports.default = CharacterController;
