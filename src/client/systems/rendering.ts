import {ISystem} from '../systemManager';
import Entity from '../entity';
import Vox from '../o3d/vox';
import * as THREE from 'three';

interface IAnimationData {
     label: string;
     fileNames: string[];
}

interface IModelData {
    fileName: string;
    size: number;
    fluxMagnitude: number;

    animations: IAnimationData[];
}

export default class RenderingSystem implements ISystem {
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

    update(dt: number) {
    }
}
