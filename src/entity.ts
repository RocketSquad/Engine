import * as THREE from 'three';
import * as uuid from 'uuid';

interface ITransformData {
    position: number[]
} 

interface IVoxData {
    file: string;
}

interface IEntityData {
    transform?: ITransformData;
    vox?: IVoxData;
}

export default class Entity extends THREE.Object3D {
    state: {[key: string]: any};
    
    constructor(data: IEntityData) {
        super();
        this.state = data;
    }
}