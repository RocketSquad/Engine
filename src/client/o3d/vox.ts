import * as path from 'path';
import * as THREE from 'three';
import { MeshBuilder } from '../engine/vox';
import { Get, On } from '../engine/assets';

export interface IAnimation {
    speed: number;
    vox: string[];
}

export interface IVoxData {
    animation?: { [key: string]: IAnimation };
    size?: number;
    rotation?: number[];
    position?: number[];
    default?: string;
    jitter?: number;
}

const BuildVoxMesh = (voxelBin, data) => {
    const builder = new MeshBuilder(voxelBin, {
        voxelSize: data.size,
        vertexColor: true,
        optimizeFaces: false,
        jitter: data.jitter
    });
    const mesh = builder.createMesh();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
};

export default class VoxModel extends THREE.Object3D {
    data: IVoxData;
    animations: any;
    current: string;
    frame: number;
    timeout: number;
    voxHolder: THREE.Object3D;

    constructor(voxData: IVoxData | Promise<IVoxData> | string) {
        super();
        if(typeof voxData === 'string') {
            On(voxData, this.setVoxData.bind(this));
            Get(voxData);
        } else {
            this.setVoxData(voxData);
        }
    }

    async setVoxData(voxData: IVoxData | Promise<IVoxData>) {
        this.stop();

        let data: IVoxData;
        if(voxData instanceof Promise) {
            data = await voxData;
        } else {
            data = voxData;
        }

        this.data = data;
        const dir = './vox';
        this.animations = {};
        data.jitter = data.jitter ? data.jitter : 0;

        if(this.data.animation) {
            Object.keys(this.data.animation).forEach(key => {
                const anim: IAnimation = this.data.animation[key];

                this.animations[key] = {
                    ...anim,
                    vox: anim.vox.map((file, i) => {
                        const filePath = path.join(dir, file);
                        return Get(filePath).then(voxelBin => {
                            return BuildVoxMesh(voxelBin, data);
                        });
                    })
                };

                anim.vox.forEach((file, i) => {
                    const filePath = path.join(dir, file);
                    On(filePath, (voxelBin) => {
                        this.animations[key].vox[i] = Promise.resolve(BuildVoxMesh(voxelBin, data));
                        if(this.current) {
                            this.play(this.current);
                        }
                    });
                });
            });
        }

        this.voxHolder = new THREE.Object3D();
        if (data.position)
            this.position.fromArray(data.position);

        if (data.rotation)
            this.rotation.fromArray(data.rotation.map(x => x * Math.PI / 180));

        this.add(this.voxHolder);

        if(this.data.default) {
            this.play(this.data.default);
        }
    }

    play(animation: string) {
        if (this.timeout) clearInterval(this.timeout);

        this.current = animation;
        this.frame = 0;
        const anim = this.animations[this.current];
        if(anim.vox.length > 0)
            this.timeout = setInterval(this.step.bind(this), this.animations[animation].speed);
        this.step();
    }

    stop() {
        if(this.timeout)
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
