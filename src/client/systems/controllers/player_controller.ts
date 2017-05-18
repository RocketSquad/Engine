import { ISystem, SystemManagerInst, addMissingDefaults } from '../../systemManager';
import Entity, { IControllerData } from '../../entity';
import {Get} from '../../engine/assets';
import * as THREE from 'three';
import VoxModel from '../../o3d/vox';
import { keys, gamepads } from '../../engine/input';
import StatsSystem, { IStatsData } from '../stats';
import RMath from '../../engine/math';
import * as Howl from 'howler';
import {current} from '../../o3d/scene';
import { IHudWindow } from "../../interface";
import { SayIt } from '../../engine/voice';

interface IWindowGame extends Window {
    camera: THREE.Camera;
}

interface ICameraData {
    cameraLookAt: number[];
    cameraOffset: number[];
    cameraLerp;
}

interface IControllerMetaData {
    type: string;
}

interface IController {
    initialize(ent: Entity);
    update(dt: number);
}

// [TODO] support an AI controller and a NetReplicated controller (for remote AI or players)
// [TODO] support multiple USB controllers on the same client
// [TODO] support input axis and events in input lib
class PlayerController implements IController {

    entity: Entity;

    constructor(entity: Entity) {
        this.entity = entity;
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

    initialize(ent: Entity) {
        return;
    }

    update(dt: number) {
        const controller = this.entity.userData.controller;
        const input = this.getControllerInput();

        let direction = this.getControllerDirection();

        // Use input for direction if no direction is given
        if(direction.lengthSq() <= controller.minInputLength * controller.minInputLength) {
            direction = input;
        }

        // Calculate and handle rotation
        if(direction.lengthSq() > controller.minInputLength * controller.minInputLength) {
            const targetRotationAngle = new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0);
            const currentRotationAngle = new THREE.Euler().copy(this.entity.rotation);

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

            this.entity.rotation.copy(currentRotationAngle);
        }

        this.entity.position.add(input.multiplyScalar(this.entity.userData.controller.moveSpeed * dt));
    }
}

let soundFired = false;
const sound = new Howl.Howl({
    src: ['./sfx/sacktap.wav'],
    volume: 0.4,
    onend: () => {
        soundFired = false;
    },
});

const coinGet = Get('./content/ammo/coin.toml');

export default class PlayerControllerSystem implements ISystem {
    relativeEntities: {[key: string]: Entity};
    controllers: {[key: string]: IController};
    target: Entity;
    clock: THREE.Clock;
    data: ICameraData;
    cooldown: number;

    constructor() {
        // [TODO] add system init TOML file
        // [TODO] decide who owns the camera, and how we take control of it or pass control around
        this.relativeEntities = {};
        this.controllers = {};
        this.clock = new THREE.Clock();
        this.cooldown = Math.floor(Math.random() * 10);
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

            switch(entity.userData.controller.type) {
                case "player":
                    this.controllers[entity.id] = new PlayerController(entity);
                    break;
                case "netReplicated":
                case "ai":
                default:
                    // [TODO] spawn ai controller for this entity
            }

            const defaults = {
                isLocalPlayer: false,
                minInputLength: 0.3,
                minRotAngle: 0.1,
            };

            addMissingDefaults(entity.userData.controller, defaults);
        }
    }

    remove(entity: Entity) {
        this.relativeEntities[entity.id] = undefined;
    }

    setEntityAsLocalPlayer(entity: Entity) {
        this.target = entity;
        entity.userData.controller.isLocalPlayer = true;
    }

    update(dt: number) {
        const delta = this.clock.getDelta();

        // Update the variety of controllers this system manages
        for(const key in this.controllers) {
            if(this.controllers[key]) {
                this.controllers[key].update(dt);
            }
        }

        // Update the camera to follow the target character
        if ((window as IWindowGame).camera && this.target) {
            const cam = (window as IWindowGame).camera;
            const axis = new THREE.Vector3().fromArray(this.data.cameraLookAt);

            const dstPosition = this.target.position.clone().add(axis);
            const camPosition = this.target.position.clone().add(new THREE.Vector3().fromArray(this.data.cameraOffset));

            cam.position.lerp(camPosition, this.data.cameraLerp);
            cam.lookAt(dstPosition);
        }


        // Vital JF2 mechanics
        const phrases = [
            'I like pina coladas, getting lost inthe rain',
            'Jurassic Fallback 2',
            'More money, more',
            'See you later alligator, work that tail',
            'I like pinya coladas',
            'Those moves are Jurra sick',
            'Let me show you my Cambrian explosion',
            'Jurassic Park that ass over here',
            'Grind that pole until you are dinosaur'
        ];

        // Space to play sounds!!
        if(keys[32] && !soundFired) {
            this.cooldown--;
            if(this.cooldown < 1) {
                SayIt(phrases[Math.round(Math.random() * (phrases.length -1))]);
                this.cooldown = 5 + Math.floor(Math.random() * 10);
            }
            const pitchShift = 4; // 4 percent random rate/pitch modulation
            sound.rate(Math.random() * pitchShift / 100 + 1.0 - (pitchShift/100/2));
            sound.play();
            soundFired = true;

            coinGet.then((data) => {
                const coin = new Entity( {
                    vox: data,
                });

                current.add(coin);
                coin.position.copy(
                    new THREE.Vector3((Math.random() * 20) - 10, Math.random() * 0.3, (Math.random() * 10) - 5));
            });

            let hwnd = window as IHudWindow;
            hwnd.hud.ba_dings++;

        }
    }
}
