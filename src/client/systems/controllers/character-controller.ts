import * as THREE from 'three';
import { keys } from '../../engine/input';
import Vox from '../../o3d/vox';
import {Get, On, Watch} from '../../engine/assets';

interface IControllerData {
    turnSpeed: number;
    forwardSpeed: number;
    cameraOffset: number[];
    cameraLookAt: number[];
    cameraLerp: number;
}

interface IWindowGame extends Window {
    camera: THREE.Camera;
}

let data: IControllerData = {
    turnSpeed: 1,
    forwardSpeed: 1,
    cameraLerp: 1,
    cameraOffset: [0, 5, 5],
    cameraLookAt: [0, 0, 0]
};

Watch('content/controller/character.toml', (newData) => {
    console.log('got', newData);
    data = newData;
});

export default class CharacterController {
    target: THREE.Object3D;
    clock: THREE.Clock;

    constructor(target: THREE.Object3D) {
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

        if (keys.w) forward = 1;
        if (keys.s) forward = -1;
        if (keys.d) turn = -1;
        if (keys.a) turn = 1;
        if (keys.x) up = 1;
        if (keys.c) up = -1;

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

        if((window as IWindowGame).camera) {
            const cam = (window as IWindowGame).camera;
            const axis = new THREE.Vector3().fromArray(data.cameraLookAt);
            // axis.applyQuaternion(this.target.quaternion);

            const dstPosition = this.target.position.clone().add(axis);
            const camPosition = this.target.position.clone().add(new THREE.Vector3().fromArray(data.cameraOffset));

            cam.position.lerp(camPosition, data.cameraLerp);
            cam.lookAt(dstPosition);
        }

    }
}
