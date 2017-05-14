import * as path from 'path';
import * as THREE from 'three';
import { MeshBuilder } from '../engine/vox';
import { Get } from '../engine/assets';

export interface IAnimation {
    speed: number;
    vox: string[];
}

export interface IVoxData {
    animation: { [key: string]: IAnimation };
    size?: number;
    rotation?: number[];
    position?: number[];
    default: string;
    jitter?: number;
}

export default class VoxModel extends THREE.Object3D {
    data: IVoxData;
    animations: any;
    current: string;
    frame: number;
    timeout: number;
    voxHolder: THREE.Object3D;

    constructor(voxData: IVoxData | Promise<IVoxData>) {
        super();
        this.setVoxData(voxData);
    }

    async setVoxData(voxData: IVoxData | Promise<IVoxData>) {
        let data: IVoxData;
        if(voxData instanceof Promise) {
            data = await voxData;
        } else {
            data = voxData;
        }

        this.data = data;
        const dir = './vox';
        this.animations = {};
        const jitter = data.jitter ? data.jitter : 0;

        Object.keys(this.data.animation).forEach(key => {
            const anim: IAnimation = this.data.animation[key];

            this.animations[key] = {
                ...anim,
                vox: anim.vox.map(file => Get(path.join(dir, file)).then(voxelBin => {
                    const builder = new MeshBuilder(voxelBin, {
                        voxelSize: data.size,
                        vertexColor: true,
                        optimizeFaces: false,
                        jitter
                    });
                    const mesh = builder.createMesh();
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    return mesh;
                })),
            };
        });
        this.voxHolder = new THREE.Object3D();
        if (data.position)
            this.voxHolder.position.fromArray(data.position);

        if (data.rotation)
            this.voxHolder.rotation.fromArray(data.rotation.map(x => x * Math.PI / 180));

        this.add(this.voxHolder);
        this.play(this.data.default);
    }

    play(animation: string) {
        if (this.timeout) clearInterval(this.timeout);

        this.current = animation;
        this.frame = 0;

        this.timeout = setInterval(this.step.bind(this), this.animations[animation].speed);
    }

    stop() {
        clearTimeout(this.timeout);
    }

    async step() {
        if (this.voxHolder.children[0])
            this.voxHolder.remove(this.voxHolder.children[0]);

        const voxList = this.animations[this.current].vox;
        const mesh = await voxList[this.frame];
        this.voxHolder.add(mesh);

        this.frame = this.frame + 1 === voxList.length ? this.frame = 0 : this.frame + 1;
    }
}
