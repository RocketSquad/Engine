import * as THREE from 'three';
import {keys, mouse} from './lib/input';
import SoundFX from './soundfx';

export default class CinematicController {
    camera: THREE.Camera;
    inputSound: SoundFX;
    cameraInitialPos: THREE.Vector3;

    // in rads/sex
    camSwayVerticalSpeed: number;
    camSwayVerticalMagnitude: number;
    camSwayHorizontalSpeed: number;
    camSwayHorizontalMagnitude: number;
    camSwayTime: number;

    constructor(camera) {
        this.camera = camera;
        this.cameraInitialPos = new THREE.Vector3().copy(new THREE.Vector3(0, 3, 10));
        this.camera.position.copy(this.cameraInitialPos);

        this.camSwayVerticalSpeed = 3.14159 * 0.1;
        this.camSwayVerticalMagnitude = 0.2;
        this.camSwayHorizontalSpeed = 3.14159 * 0.3;
        this.camSwayHorizontalMagnitude = 0.03;

        this.camSwayTime = 0;
        this.inputSound = new SoundFX('./sfx/sacktap.wav');
    }

    tick(dt: number) {
        if(keys[' ']) this.inputSound.play();

        this.camSwayTime += dt;

        const newPosition = new THREE.Vector3().copy(this.cameraInitialPos);
        newPosition.add(new THREE.Vector3(
            Math.sin(this.camSwayTime * this.camSwayHorizontalSpeed) * this.camSwayHorizontalMagnitude,
            Math.sin(this.camSwayTime * this.camSwayVerticalSpeed) * this.camSwayVerticalMagnitude,
            0,
        ));

        this.camera.position.copy(newPosition);
    }
}
