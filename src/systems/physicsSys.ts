import {ISystem} from '../systemManager';
import Entity from '../entity';

interface ISphereData {
    radius: number;
}

interface IBoxData {
    extentX: number;
    extentY: number;
    extentZ: number;
}

interface IPhysicsData {
    colliderType: string;
    colliderData: IBoxData | ISphereData;
}

export default class PhysicsSystem implements ISystem {

    add(entity: Entity) {

    }

    remove(entity: Entity) {

    }

    update(dt: number) {

    }
}