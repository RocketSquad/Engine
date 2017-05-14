import * as THREE from 'three';
import {keys} from '../engine/input';
import Vox from '../o3d/vox';
import {Get} from '../engine/assets';

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

const dataPromise: Promise<IControllerData> = Get('../content/controller/character.toml');
let data: IControllerData;

export default class CharacterController {
    target: Vox;
    clock: THREE.Clock;

    constructor(target: Vox) {
        this.target = target;
        this.tick = this.tick.bind(this);
        this.setup();
    }

    async setup() {
        data = await dataPromise;
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

        if(keys.w) forward = 1;
        if(keys.s) forward = -1;
        if(keys.d) turn = -1;
        if(keys.a) turn = 1;
        if(keys.x) up = 1;
        if(keys.c) up = -1;

        this.target.rotateY(turn * delta * data.turnSpeed);
        this.target.translateZ(forward * delta * data.forwardSpeed);
        this.target.translateY(up * delta * data.forwardSpeed);

        const walking = forward !== 0 || turn !== 0;

        if(walking && this.target.current !== 'walk') {
            this.target.play('walk');
        } else if(!walking && this.target.current !== 'idle') {
            this.target.play('idle');
        }

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
