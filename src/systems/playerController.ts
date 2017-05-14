import { ISystem, SystemManagerInst } from '../systemManager';
import Entity, { IControllerData } from '../entity';
import * as THREE from 'three';
import VoxModel from '../o3d/vox';
import { keys } from '../engine/input';
import StatsSystem, { IStatsData } from './stats';

interface IWindowGame extends Window {
    camera: THREE.Camera;
}

interface ICameraData {
    cameraLookAt: number[];
    cameraOffset: number[];
    cameraLerp;
}

export default class PlayerControllerSystem implements ISystem {
    relativeEntities: Entity[];
    target: Entity;
    clock: THREE.Clock;
    data: ICameraData;

    constructor() {
        this.relativeEntities = [];
        this.clock = new THREE.Clock();
        this.data = {
            cameraLookAt: [0, 0, 1],
            cameraOffset: [0, 8, 5],
            cameraLerp: 1,
        };
    }

    add(entity: Entity) {
        if (entity.userData.controller !== undefined) {
            this.relativeEntities[entity.id] = entity;
            this.target = entity;
            entity.userData.controller.isLocalPlayer = false;
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

        return new THREE.Vector3(turn, up, -forward);
    }

    getControllerDirection() {
        let forward = 0;
        let turn = 0;
        let up = 0;

        if (keys.w) forward = 1;
        if (keys.s) forward = -1;
        if (keys.d) turn = 1;
        if (keys.a) turn = -1;
        if (keys.x) up = 1;
        if (keys.c) up = -1;

        return new THREE.Vector3(turn, up, -forward);
    }

    update(dt: number) {
        const delta = this.clock.getDelta();

        this.relativeEntities.forEach(entity => {
            let input = this.getControllerInput();

            if (keys.w || keys.s || keys.d || keys.a) {
                const statSystem = SystemManagerInst.getSystemByName("StatsSystem") as StatsSystem;
                statSystem.dealDamage(entity, 50, dt);
            }

            let direction = this.getControllerDirection();
            const stats = entity.userData as IStatsData;
            if (stats.dead) {
                direction = new THREE.Vector3(0, 0, 0);
                input = new THREE.Vector3(0, 0, 0);
            }
            entity.position.add(input.multiplyScalar(entity.userData.controller.moveSpeed * dt));
            entity.rotation.copy(new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0));
        });

        if ((<IWindowGame>window).camera && this.target) {
            const cam = (<IWindowGame>window).camera;
            const axis = new THREE.Vector3().fromArray(this.data.cameraLookAt);
            // axis.applyQuaternion(this.target.quaternion);

            const dstPosition = this.target.position.clone().add(axis);
            const camPosition = this.target.position.clone().add(new THREE.Vector3().fromArray(this.data.cameraOffset));

            cam.position.lerp(camPosition, this.data.cameraLerp);
            cam.lookAt(dstPosition);
        }
    }
}
