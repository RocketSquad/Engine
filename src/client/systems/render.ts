import {ISystem, System} from '../engine/system';
import {IEntity, State} from '../engine/state';
import * as THREE from 'three';
import {IVoxData} from '../o3d/vox';

interface ITransformComponent {
    size?: number | number[];
    rotation?: number[];
    position?: number[];
}

interface IRenderComponent {
    vox: IVoxData;
}

export class Render extends System {
    // Entire Scene
    public scene = new THREE.Scene();
    private entityMap: {[key: string]: THREE.Object3D} = {};

    UpdateO3D(entity: IEntity) {
        const o3d = this.entityMap[entity.id];

        const t = entity.transform;
        if(t) {
            o3d.position.fromArray(entity.transform.position);
        }

    }

    Add(entity: IEntity) {
        super.Add(entity);
        const o3d = this.entityMap[entity.id] = new THREE.Object3D();
        const list = entity.id.split('.');
        const parent = list.length > 1
            ? this.entityMap[list.slice(0, -1).join('.')]
            : this.scene;
        parent.add(o3d);

        this.UpdateO3D(entity);
    }

    Remove(entity: IEntity) {
        super.Remove(entity);
        this.entityMap[entity.id]
    }
}
