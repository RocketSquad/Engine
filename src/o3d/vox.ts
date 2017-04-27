import * as path from 'path';
import * as THREE from 'three';

declare const vox: any;

const parser = new vox.Parser();

export interface IAnimation {
    speed: number;
    vox: string[];
}

export interface IVoxData {
    animation: {[key: string]: IAnimation};
    size?: number;
    rotation?: number[];
    position?: number[];
    default: string;
}

export default class VoxModel extends THREE.Object3D {
    data: IVoxData;
    animations: any;
    current: string;
    frame: number;
    timeout: number;
    voxHolder: THREE.Object3D;

    constructor(voxData: IVoxData) {
        super();
        this.data = voxData;
        const dir = './vox';
        this.animations = {};

        Object.keys(this.data.animation).forEach(key => {
            const anim: IAnimation = this.data.animation[key];

            this.animations[key] = {
                ...anim,
                vox: anim.vox.map(file => parser.parse(path.join(dir, file)).then(voxelBin => {
                    const builder = new vox.MeshBuilder(voxelBin, { voxelSize: voxData.size });
                    const mesh = builder.createMesh();
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    return mesh;
                })),
            };
        });
        this.voxHolder = new THREE.Object3D();
        if(voxData.position)
            this.voxHolder.position.fromArray(voxData.position);

        if(voxData.rotation)
            this.voxHolder.rotation.fromArray(voxData.rotation.map(x => x * Math.PI/180));

        this.add(this.voxHolder);
        this.play(this.data.default);
    }

    play(animation: string) {
        if(this.timeout) clearInterval(this.timeout);

        this.current = animation;
        this.frame = 0;

        this.timeout = setInterval(this.step.bind(this), this.animations[animation].speed);
    }

    stop() {
        clearTimeout(this.timeout);
    }

    async step() {
        if(this.voxHolder.children[0])
            this.voxHolder.remove(this.voxHolder.children[0]);

        const voxList = this.animations[this.current].vox;
        const mesh = await voxList[this.frame];
        this.voxHolder.add(mesh);

        this.frame = this.frame + 1 === voxList.length ? this.frame = 0 : this.frame + 1;
    }
}
