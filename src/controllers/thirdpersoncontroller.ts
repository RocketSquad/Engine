import * as THREE from 'three';
import {JoshuaTree} from './engine/joshuatree';
import {keys, mouse} from './engine/input';
import Vox from './o3d/vox';
import Weapon from './o3d/weapon';

const data: IControllerData = require('./content/character-controller.toml');
const weapon = require('./content/weapons/bolter.toml');

interface IControllerData {
    movement: {
        speed: number;
        turn: number;
    };

    camera: {
        lerp: number;

        distance: {
            x: number;
            y: number;
            z: number;
        };

        offset: {
            x: number;
            y: number;
            z: number;
        };
    };


}

export default class ThirdPersonController {
    cam: THREE.Camera;
    character: Vox;
    targeter: THREE.Vector3;
    distance: THREE.Vector3;
    targetOffset: THREE.Vector3;
    weapon: Weapon;

    constructor(cam: THREE.Camera, character: Vox) {
        this.distance = new THREE.Vector3(data.camera.distance.x, data.camera.distance.y, data.camera.distance.z);
        this.targetOffset = new THREE.Vector3(data.camera.offset.x, data.camera.offset.y, data.camera.offset.z);
        this.cam = cam;
        this.targeter = new THREE.Vector3();
        this.character = character;
        this.weapon = new Weapon(weapon);
        this.character.add(this.weapon);
    }

    tick(delta: number) {
        const moveDelta = new THREE.Vector3(0, 0, 0);

        const faceTo = new THREE.Vector3(
            this.character.position.x + -2 * mouse.xp,
            this.character.position.y,
            this.character.position.z + -2 * mouse.yp,
        );

        this.targeter.lerp(faceTo, data.movement.turn);
        this.character.lookAt(this.targeter);

        if(mouse.left) {
            this.weapon.fire();
        }
        /*
        let yRot = 0;

        if(Math.abs(mouse.xp) > data.mouse.radius) {
           yRot = mouse.xp * data.mouse.turnSpeed * delta;
        }
          this.character.rotateY(yRot);
        */

        if(keys.w) moveDelta.setZ(1);
        if(keys.s) moveDelta.setZ(-1);
        if(keys.d) moveDelta.setX(-1);
        if(keys.a) moveDelta.setX(1);

        const moved = moveDelta.x || moveDelta.z || moveDelta.y;
        if(moved && this.character.current === 'idle') {
            this.character.play('walk');
        }

        if(!moved && this.character.current === 'walk') {
            this.character.play('idle');
        }

        this.character.position.add(moveDelta.multiplyScalar(data.movement.speed * delta));
        this.cam.position.lerp(this.character.position.clone().add(this.distance), data.camera.lerp);
        this.cam.lookAt(this.character.position.clone().add(this.targetOffset));
    }
}
