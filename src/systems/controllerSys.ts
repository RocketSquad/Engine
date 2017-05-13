import {ISystem} from '../systemManager';
import Entity from '../entity';
import VoxModel from '../o3d/vox';

interface IControllerData {
    speed: number;
}

export default class PlayerControllerSystem implements ISystem {
    relativeEntities: Entity[];

    constructor() {
        this.relativeEntities = [];
    }

    add(entity: Entity) {
        if(entity.state['voxModel'] !== undefined) {
            this.relativeEntities[entity.entityId] = entity;
        }
    }

    remove(entity: Entity) {
        this.relativeEntities[entity.entityId] = undefined;
    }

    getControllerInput() {

    }

    update(dt: number) {
        this.relativeEntities.forEach(entity => {
            return;// buuttttssss
        });
    }
}
