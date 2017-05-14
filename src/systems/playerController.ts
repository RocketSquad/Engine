import { ISystem, SystemManagerInst } from '../systemManager';
import Entity, { IControllerData } from '../entity';
import {Get} from '../engine/assets';
import * as THREE from 'three';
import VoxModel from '../o3d/vox';
import { keys, gamepads } from '../engine/input';
import StatsSystem, { IStatsData } from './stats';
import RMath from '../engine/math';
import * as Howl from 'howler';
import {current} from '../o3d/scene';
import { IHudWindow } from "../interface";

interface IWindowGame extends Window {
    camera: THREE.Camera;
}

interface ICameraData {
    cameraLookAt: number[];
    cameraOffset: number[];
    cameraLerp;
}

let soundFired = false;
const sound = new Howl.Howl({
    src: ['./sfx/sacktap.wav'],
    onend: () => {
        soundFired = false;
    },
});

const coinGet = Get('./content/ammo/coin.toml');

export default class PlayerControllerSystem implements ISystem {
    relativeEntities: Entity[];
    target: Entity;
    clock: THREE.Clock;
    data: ICameraData;

    constructor() {
        this.relativeEntities = [];
        this.clock = new THREE.Clock();
        this.data = {
            cameraLookAt: [0, 2, -1],
            cameraOffset: [0, 4, 3],
            cameraLerp: 1,
        };
    }

    add(entity: Entity) {
        if (entity.userData.controller !== undefined) {
            entity.position.set(0, 0, 7);
            this.relativeEntities[entity.id] = entity;
            this.target = entity;
            entity.userData.controller.isLocalPlayer = false;
            entity.userData.controller.minInputLength = 0.3;
            entity.userData.controller.minRotAngle = 0.1;
        }
    }

    remove(entity: Entity) {
        this.relativeEntities[entity.id] = undefined;
    }

    setEntityAsLocalPlayer(entity: Entity) {
        this.target = entity;
        entity.userData.controller.isLocalPlayer = true;
    }

    getControllerInput(): THREE.Vector3 {
        let forward = 0;
        let turn = 0;
        let up = 0;

        if (keys.w) forward = 1;
        if (keys.s) forward = -1;
        if (keys.d) turn = 1;
        if (keys.a) turn = -1;
        if (keys.x) up = 1;
        if (keys.c) up = -1;

        const gp = navigator.getGamepads()[0];

        if(gp) {
            forward = -gp.axes[1];
            if(Math.abs(forward) < 0.1) forward = 0;
            turn = gp.axes[0];
            if(Math.abs(turn) < 0.1) turn = 0;
        }

        return new THREE.Vector3(turn, up, -forward);
    }

    getControllerDirection() {
        let forward = 0;
        let turn = 0;

        if (keys[38]) forward = 1;
        if (keys[40]) forward = -1;
        if (keys[37]) turn = -1;
        if (keys[39]) turn = 1;

        const gp = navigator.getGamepads()[0];

        if(gp) {
            forward = -gp.axes[3];
            turn = gp.axes[2];
        }

        return new THREE.Vector3(turn, 0, -forward);
    }

    update(dt: number) {
        const delta = this.clock.getDelta();

        this.relativeEntities.forEach(entity => {
            const controller = entity.userData.controller;
            let input = this.getControllerInput();

            if (keys.w || keys.s || keys.d || keys.a) {
                const statSystem = SystemManagerInst.getSystemByName("StatsSystem") as StatsSystem;
                statSystem.useStamina(entity, 50, dt);
            }

            let direction = this.getControllerDirection();
            const stats = entity.userData as IStatsData;

            if (stats.dead) {
                direction = new THREE.Vector3(0, 0, 0);
                input = new THREE.Vector3(0, 0, 0);
            }

            entity.position.add(input.multiplyScalar(entity.userData.controller.moveSpeed * dt));

            // Use input for direction if no direction is given
            if(direction.lengthSq() <= controller.minInputLength * controller.minInputLength) {
                direction = input;
            }

            // Calculate and handle rotation
            if(direction.lengthSq() > controller.minInputLength * controller.minInputLength) {
                const targetRotationAngle = new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0);
                const currentRotationAngle = new THREE.Euler().copy(entity.rotation);

                let deltaAngle = RMath.SmallestAngleBetweenAngles(targetRotationAngle.y, currentRotationAngle.y);
                deltaAngle *= RMath.radToDegree;

                let rotDir;
                if(Math.abs(deltaAngle) > controller.minRotAngle) {
                    rotDir = deltaAngle / Math.abs(deltaAngle);
                } else {
                    rotDir = 0;
                }

                const currentRot = currentRotationAngle.y * RMath.radToDegree;
                const nextDeltaRot = rotDir * Math.min(dt * controller.rotSpeed, Math.abs(deltaAngle));
                const nextAngle = ((currentRot + nextDeltaRot) % 360 + 360) % 360;

                currentRotationAngle.y = Math.min(nextAngle * RMath.degreeToRad);

                entity.rotation.copy(currentRotationAngle);
            }
        });

        if ((window as IWindowGame).camera && this.target) {
            const cam = (window as IWindowGame).camera;
            const axis = new THREE.Vector3().fromArray(this.data.cameraLookAt);

            const dstPosition = this.target.position.clone().add(axis);
            const camPosition = this.target.position.clone().add(new THREE.Vector3().fromArray(this.data.cameraOffset));

            cam.position.lerp(camPosition, this.data.cameraLerp);
            cam.lookAt(dstPosition);
        }

        // Space to play sounds!!
        if(keys[32] && !soundFired) {
            const pitchShift = 4; // 4 percent random rate/pitch modulation
            sound.rate(Math.random() * pitchShift / 100 + 1.0 - (pitchShift/100/2));
            sound.play();
            soundFired = true;

            coinGet.then((data) => {
                const coin = new Entity( {
                    vox: data,
                });
                console.log('made coin!');

                current.add(coin);
                coin.position.copy(
                    new THREE.Vector3((Math.random() * 20) - 10, Math.random() * 0.3, (Math.random() * 10) - 5));
            });

            let hwnd = window as IHudWindow;
            hwnd.hud.ba_dings++;

        }
    }
}
