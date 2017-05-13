import * as THREE from 'three';

interface IEntityData {
    stuff: any; // [TODO] fill out with real entity properties
}

let currentEntityId = 0;

export default class Entity extends THREE.Object3D {
    entityId: number;
    state: {[key: string]: any};
    
    constructor(data: IEntityData) {
        super();
        this.state = data;
        this.entityId = currentEntityId;
        ++currentEntityId;
    }
}