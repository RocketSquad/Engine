import {ISystem} from '../systemManager';
import Entity from '../entity';
import VoxModel from '../o3d/vox';

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
    vox: {[entityId: number]: VoxModel};
    relativeEntities: {[entityId: number]: Entity};

    constructor() {
        this.vox = {};
        this.relativeEntities = {};
    }

    add(entity: Entity) {
        if(entity.state['voxModel'] !== undefined) {
            this.vox[entity.entityId] = new VoxModel(entity.state['voxModel']);
            this.relativeEntities[entity.entityId] = entity;
        }
    }

    remove(entity: Entity) {
        this.vox[entity.entityId] = undefined;
        this.relativeEntities[entity.entityId] = undefined;
    }

    update(dt: number) {
        for(let prop in this.vox){
            console.log('asdeergf');
        };
    }
}
