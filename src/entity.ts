import * as THREE from 'three';
import * as uuid from 'uuid';

export interface ITransformData {
    position: number[];
}

export interface IVoxData {
    file: string;
}

export interface IControllerData {
    moveSpeed: number;
    rotSpeed: number;
}

interface IEntityData {
    transform?: ITransformData;
    vox?: IVoxData;
    controller?: IControllerData;
}

export default class Entity extends THREE.Object3D {

    constructor(data: IEntityData) {
        super();
        this.userData = data;
    }
}
