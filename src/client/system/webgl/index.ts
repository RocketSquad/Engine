import {ISystem, System} from 'common/engine/system';
import {IEntity, State} from 'common/engine/state';

import * as THREE from 'three';
import {IVoxComponent, VoxMesh} from './o3d/vox-mesh';

const throttle = (type: string, name: string, obj?: any) => {
    obj = obj || window;
    let running = false;
    const func = () => {
        if (running) { return; }
        running = true;
        requestAnimationFrame(() => {
            obj.dispatchEvent(new CustomEvent(name));
            running = false;
        });
    };
    obj.addEventListener(type, func);
};

interface ITransformComponent {
    size?: number | number[];
    rotation?: number[];
    position?: number[];
}

interface ILightComponent {
    color?: number;
    position?: number[];
    intensity?: number;
}

interface ICameraComponent {
    rotation?: number[];
    position?: number[];
    target?: number[];
}

interface IDirectionalLightComponent extends ILightComponent {
    target?: number[];
}

const LightUpdate = (light, data) => {
    if(data.color !== undefined)
        light.color.setHex(data.color);
    if(data.intensity !== undefined)
        light.intensity = data.intensity;
};

const TransformUpdate = (o3d, data) => {
    if(data.position)
        o3d.position.fromArray(data.position);
    if(data.rotation)
        o3d.rotation.fromArray(data.rotation);
};

const TargetUpdate = (o3d, data) => {
    TransformUpdate(o3d, data);
    if(data.target)
        o3d.target.fromArray(data.target);
};

export class WebGL extends System {
    // Use me if.. you have
    public components = {
        directional: 'IDirectionalLightComponent',
        ambient: 'ILightComponent',
        vox: 'IVoxComponent',
        camera: 'ICameraComponent'
    };

    // Entire Scene
    private scene = new THREE.Scene();
    private entityMap: {[key: string]: THREE.Object3D} = {};
    private camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    private renderer =  new THREE.WebGLRenderer({ antialias: true });

    start() {
        (window as any).scene = this.scene;
        throttle('resize', 'optimizedResize');
        window.addEventListener('optimizedResize', this.handleResize.bind(this));
        this.handleResize();
        document.body.appendChild(this.renderer.domElement);
    }

    update(entity: IEntity) {
        this.updateO3D(entity);
    }

    add(entity: IEntity) {
        super.add(entity);
        this.updateO3D(entity);
    }

    remove(entity: IEntity) {
        super.remove(entity);
        const obj = this.entityMap[entity.id];
        obj.parent.remove(obj);
        delete this.entityMap[entity.id];
    }

    tick(delta: number) {
        this.renderer.render(this.scene, this.camera);
    }

    private handleResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
    }

    // Delta updates sure would be nice
    private updateO3D(entity: IEntity) {
        const o3d = this.get(entity.id);
        const t: ITransformComponent = entity;

        if(t.position || t.rotation) {
            TransformUpdate(o3d, t);
        }

        const v: IVoxComponent = entity.vox;
        if(v) {
            if(!o3d.userData.vox) {
                o3d.userData.vox = new VoxMesh(v);
                o3d.add(o3d.userData.vox);
            } else {
                o3d.userData.vox.update(v);
            }
        } else if(o3d.userData.vox) {
            // Check to see if we have a vox and remove it
            o3d.remove(o3d.userData.vox);
            o3d.userData.vox.stop();
        }

        const ambient: ILightComponent = entity.ambient;
        if(ambient) {
            let light = o3d.userData.ambient;

            if(!light) {
                light = o3d.userData.ambient = new THREE.AmbientLight();
                o3d.add(light);
            }

            LightUpdate(light, ambient);
        } else if(o3d.userData.ambient) {
            o3d.remove(o3d.userData.ambient);
        }

        const directional: IDirectionalLightComponent = entity.directional;
        if(directional) {
            let light = o3d.userData.directional;
            if(!light) {
                light = o3d.userData.directional = new THREE.DirectionalLight();
                o3d.add(light);
            }

            LightUpdate(light, directional);
            TargetUpdate(light, directional);
        }

        const camera: ICameraComponent = entity.camera;
        if(camera) {
            let camObj = o3d.userData.camera;
            if(!camObj) {
                camObj = o3d.userData.camera = new THREE.PerspectiveCamera(
                    75,
                    window.innerWidth/window.innerHeight,
                    0.1,
                    1000
                );

                this.camera = camObj;
            }

            TargetUpdate(camObj, camera);
        }
    }

    private get(entityId: string) {
        if(this.entityMap[entityId] !== undefined) {
            return this.entityMap[entityId];
        }

        const o3d = new THREE.Object3D();
        o3d.name = entityId;
        this.entityMap[entityId] = o3d;

        const list = entityId.split('.');
        const parent = list.length > 1
            ? this.get(list.slice(0, -1).join('.'))
            : this.scene;

        parent.add(o3d);

        return o3d;
    }
}
