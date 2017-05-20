import * as THREE from 'three';
import * as Input from '../engine/input';
import Vox from '../o3d/vox';
import {Get, On, Watch} from '../engine/assets';

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
    input: THREE.Vector3;

    constructor(target: THREE.Object3D) {
        this.target = target;
        this.tick = this.tick.bind(this);
        this.input = new THREE.Vector3();
        this.setup();
    }

    async setup() {
        this.clock = new THREE.Clock();
        this.target.position.set(0, 0, -5);
        Input.on('forward', value=>this.input.z += value);
        Input.on('right', value=>this.input.x += value);
        Input.on('up', value=>this.input.y += value);
        this.tick();
    }

    tick() {
        const delta = this.clock.getDelta();
        const forward = this.input.z;
        const turn = this.input.x;
        const up = this.input.y;

        this.input = new THREE.Vector3();

        requestAnimationFrame(this.tick);

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
