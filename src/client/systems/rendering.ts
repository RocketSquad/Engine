import { ISystem, Entity } from './interfaces';
import Vox from '../o3d/vox';
import * as THREE from 'three';

class RenderingSystem implements ISystem {
    vox: {[entityId: number]: Vox};
    relativeEntities: {[entityId: number]: Entity};

    constructor() {
        this.vox = {};
        this.relativeEntities = {};
    }

    add(entity: Entity) {
        if(entity.userData['vox'] !== undefined) {
            this.vox[entity.id] = new Vox(entity.userData['vox']);
            this.relativeEntities[entity.id] = entity;
            entity.add(this.vox[entity.id]);
        }
    }

    remove(entity: Entity) {
        this.vox[entity.id] = undefined;
        this.relativeEntities[entity.id] = undefined;
    }
}

export default new RenderingSystem();
