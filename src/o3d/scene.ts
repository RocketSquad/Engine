import * as THREE from 'three';
import {IVoxData} from './vox';

interface IInstanceData extends IVoxData {
    type: 'vox' | 'weapon';
    file: string; // Vox file path
}

interface ISceneData {
    vox: IInstanceData[];
}


export default class Scene extends THREE.Scene {
    clock: THREE.Clock;

    constructor(sceneData?: ISceneData) {
        super();
        current = this;
    }
}

export let current: Scene = new Scene();
