import * as THREE from 'three';
import {keys, mouse} from './engine/input';

export default class FlyCharacter{
    cameraRef: THREE.Camera;
    speed: number = 3;
    rotationSpeedX: number = 90;
    rotationSpeedY: number = 90;
    forward: THREE.Vector3;
    right: THREE.Vector3;
    up: THREE.Vector3;

    // Keep track of rotation to manually rotate (avoiding Order of Operation fuckery)
    // Wrapped within [0, 360]
    rotX: number = 0;
    rotY: number = 0;

    constructor(cam: THREE.Camera){
        this.cameraRef = cam;
        this.forward = new THREE.Vector3(0, 0, -1);
        this.right = new THREE.Vector3(1, 0, 0);
        this.up = new THREE.Vector3(0, 1, 0);
    }

    _updateMovement(dt: number){
        if(keys.a){
            let rightMove = new THREE.Vector3().copy(this.right);
            rightMove.multiplyScalar(-this.speed * dt);

            this.cameraRef.position.addVectors(
                this.cameraRef.position, 
                rightMove);
        }
        if(keys.d){
            let rightMove = new THREE.Vector3().copy(this.right);
            rightMove.multiplyScalar(this.speed * dt);

            this.cameraRef.position.addVectors(
                this.cameraRef.position, 
                rightMove);
        }
        if(keys.w){
            let forwardMove = new THREE.Vector3().copy(this.forward);
            forwardMove.multiplyScalar(this.speed * dt);

            this.cameraRef.position.addVectors(
                this.cameraRef.position, 
                forwardMove);
        }
        if(keys.s){
            let forwardMove = new THREE.Vector3().copy(this.forward);
            forwardMove.multiplyScalar(-this.speed * dt);

            this.cameraRef.position.addVectors(
                this.cameraRef.position, 
                forwardMove);
        }

        if(keys.e){
            let upMove = new THREE.Vector3().copy(this.up);
            upMove.multiplyScalar(this.speed * dt);

            this.cameraRef.position.addVectors(
                this.cameraRef.position, 
                upMove);
        }
        
        if(keys.q){
            let upMove = new THREE.Vector3().copy(this.up);
            upMove.multiplyScalar(-this.speed * dt);

            this.cameraRef.position.addVectors(
                this.cameraRef.position, 
                upMove);
        }
    }

    _updateRotation(dt: number){
        let left = 37;
        let up = 38;
        let right = 39;
        let down = 40;

        if(keys[up]){
            this.rotX += this.rotationSpeedX * dt;
            this.rotX %= 360;
        }
        if(keys[down]){
            this.rotX -= this.rotationSpeedX * dt;
            this.rotX %= 360;
        }
        if(keys[left]){
            this.rotY += this.rotationSpeedY * dt;
            this.rotY %= 360;
        }
        if(keys[right]){
            this.rotY -= this.rotationSpeedY * dt;
            this.rotY %= 360;
        }

        let degToRad = 3.14159/180;
        let rotYRad = this.rotY * degToRad;
        let rotXRad = this.rotX * degToRad;
        this.cameraRef.rotation.setFromVector3(new THREE.Vector3(0, 0, 0));
        this.cameraRef.rotateY(rotYRad);
        this.cameraRef.rotateX(rotXRad);

        // [TODO] Update character orientation vectors here
        this.forward = new THREE.Vector3(-Math.sin(rotYRad), 0, -Math.cos(rotYRad));
        this.right = new THREE.Vector3(Math.cos(rotYRad), 0, -Math.sin(rotYRad));
    }

    update(clock: THREE.Clock){
        let dt = clock.getDelta();

        this._updateMovement(dt);
        this._updateRotation(dt);
    }
}   