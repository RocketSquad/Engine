import {ISystem, System} from 'common/engine/system';
import {IEntity, State, DoSet} from 'common/engine/state';
import {Input} from 'client/engine/input';
import * as THREE from 'three';
const equals = require('deep-equal');

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
        camera: 'ICameraComponent',
        position: 'IPosition',
        rotation: 'IRotation'
    };

    private cooldown = 0;
    private camera: IEntity;
    private controllers: {[key: string]: IEntity} = {};

    // we actually care about the component data
    add(entity: IEntity) {
        super.add(entity);
        if(entity.controller)
            this.update(entity, 'controller');

        if(entity.camera) {
            if(!entity.camera.position || !entity.camera.rotation) {
                this.dispatch(DoSet(entity.id, 'camera', Object.assign({
                    position: [0, 0, 0],
                    rotation: [0, 0, 0]
                }, entity.camera)));
            }

            this.update_camera(entity);
        }

        // Require position and rotation set
        if(!entity.position) {
            this.dispatch(DoSet(entity.id, 'position', [0, 0, 0]));
        }

        if(!entity.rotation) {
            this.dispatch(DoSet(entity.id, 'rotation', [0, 0, 0]));
        }
    }

    remove(entity: IEntity) {
        super.remove(entity);
        if(entity.controller)
            delete this.controllers[entity.id];
        if(entity.camera)
            delete this.camera;
    }

    update_camera(entity) {
        this.camera = entity;
    }

    update(entity, component) {
        if(entity.controller) {
            this.controllers[entity.id] = entity;
        }

        super.update(entity, component);
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

            const pos = entity.position || [0, 0, 0];
            t3d.position.fromArray(pos);
            t3d.rotation.fromArray((entity.rotation || [0, 0, 0]).map(THREE.Math.degToRad));

            t3d.rotateY(turn * delta * controls.turnSpeed);
            t3d.translateZ(forward * delta * controls.forwardSpeed);
            t3d.translateY(up * delta * controls.forwardSpeed);

            const velocity = t3d.position.toArray().map((n, i) => (n - pos[i]) * 100);
            const rotation = t3d.rotation.toArray().slice(0, 3).map(THREE.Math.radToDeg);

            if(keys.space && this.cooldown < 0) {
                velocity[1] = 100;
                this.cooldown = 1;
            }

            if(!equals(rotation, entity.rotation)) {
                this.dispatch(DoSet(entity.id, 'rotation', rotation));
            }

            if(!equals(velocity, entity.body.velocity))
                this.dispatch(DoSet(entity.id, 'body', Object.assign({}, entity.body, {velocity})));

            if(this.camera) {
                const axis = new THREE.Vector3().fromArray(controls.cameraLookAt);
                const camera = this.camera.camera;

                const dstPosition = t3d.position.clone().add(axis);
                const camPosition = t3d.position.clone().add(new THREE.Vector3().fromArray(controls.cameraOffset));

                t3d.position.fromArray(camera.position);
                t3d.rotation.fromArray(camera.rotation.map(THREE.Math.degToRad));

                t3d.position.lerp(camPosition, controls.cameraLerp);

                const newCamera = Object.assign({}, camera, {
                    target: dstPosition.toArray(),
                    position: t3d.position.toArray()
                });

                if(!equals(newCamera, camera))
                    this.dispatch(DoSet(this.camera.id, 'camera', newCamera));
            }
        });
    }
}
