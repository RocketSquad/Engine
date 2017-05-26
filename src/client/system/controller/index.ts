import {ISystem, System} from 'common/engine/system';
import {IEntity, State} from 'common/engine/state';
import {Input} from 'client/engine/input';
import * as THREE from 'three';

interface IControllerComponent {
    turnSpeed: number;
    forwardSpeed: number;
    cameraOffset: number[];
    cameraLookAt: number[];
    cameraLerp: number;
}

const defaults: IControllerComponent = {
    turnSpeed: 1,
    forwardSpeed: 1,
    cameraLerp: 1,
    cameraOffset: [0, 5, 5],
    cameraLookAt: [0, 0, 0]
};

const defaultTransform = {
    position: [0, 0, 0],
    rotation: [0, 0, 0]
};

export class Controller extends System {
    // used for three math operations
    private static t3d = new THREE.Object3D();
    
    public components = {
        controller: 'IControllerComponent',
        camera: 'ICameraComponent'
    };

    private cooldown = 0;
    private camera: IEntity;
    private controllers: {[key: string]: IEntity} = {};

    // we actually care about the component data
    add(entity: IEntity) {
        super.add(entity);
        if(entity.controller)
            this.controllers[entity.id] = entity;

        if(entity.camera) {
            entity.camera.position = entity.camera.position || [0, 0, 0];
            entity.camera.rotation = entity.camera.rotation || [0, 0, 0];
            this.camera = entity;
        }

        // TODO: Use our redux patternz
        // TODO: Oh god please schema come soon
        if(!entity.position || !entity.rotation) {
            entity.position = entity.position || [0, 0, 0];
            entity.rotation = entity.rotation || [0, 0, 0];
            this.state.set(entity.id, entity);
        }
    }

    remove(entity: IEntity) {
        super.remove(entity);
        if(entity.controller)
            delete this.controllers[entity.id];
        if(entity.camera)
            delete this.camera;
    }

    update(entity: IEntity) {
        if(entity.controller)
            this.controllers[entity.id] = entity;
        if(entity.camera)
            this.camera = entity;
    }

    tick(delta) {
        this.cooldown -= delta;
        Object.keys(this.controllers).forEach(key => {
            const entity = this.controllers[key];

            const controls: IControllerComponent = Object.assign(
                {}, defaults, entity.controller);

            const t3d = Controller.t3d;
            const keys = Input.keyboard.rawKeys;

            const forward = (keys.w && -1) || (keys.s && 1) || 0;
            const turn = (keys.a && 1) || (keys.d && -1) || 0;
            const up = (keys.x && -1) || (keys.c && 1) || 0;

            t3d.position.fromArray(entity.position);
            t3d.rotation.fromArray((entity.rotation || [0, 0, 0]).map(THREE.Math.degToRad));

            t3d.rotateY(turn * delta * controls.turnSpeed);
            t3d.translateZ(forward * delta * controls.forwardSpeed);
            t3d.translateY(up * delta * controls.forwardSpeed);

            entity.body.velocity = t3d.position.toArray().map((n, i) => (n - entity.position[i]) * 100);
            entity.rotation = t3d.rotation.toArray().slice(0, 3).map(THREE.Math.radToDeg);

            if(keys.space && this.cooldown < 0) {
                entity.body.velocity[1] = 100;
                this.cooldown = 1;
            }

            this.state.set(entity.id, entity);
            if(this.camera) {
                const axis = new THREE.Vector3().fromArray(controls.cameraLookAt);
                const camera = this.camera.camera;

                const dstPosition = t3d.position.clone().add(axis);
                const camPosition = t3d.position.clone().add(new THREE.Vector3().fromArray(controls.cameraOffset));

                t3d.position.fromArray(camera.position);
                t3d.rotation.fromArray(camera.rotation.map(THREE.Math.degToRad));

                t3d.position.lerp(camPosition, controls.cameraLerp);
                camera.target = dstPosition.toArray();
                camera.position = t3d.position.toArray();
                this.state.set(this.camera.id, this.camera);
            }
        });
    }
}
