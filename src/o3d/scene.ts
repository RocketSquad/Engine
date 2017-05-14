import * as THREE from 'three';
import Vox, { IVoxData } from './vox';
import { Gets, Get } from '../engine/assets';
import CharacterController from '../controllers/character-controller';
import Entity from '../entity';
import * as uuid from 'uuid';
import {SystemManagerInst} from '../systemManager';

interface IInstanceData extends IVoxData {
    file?: string;
    child?: IInstanceData[];
    def?: string;
}

interface ISceneData {
    entity?: IInstanceData[];
    def?: {[key: string]: IInstanceData};
}

interface IVec3 {
    x: number;
    y: number;
    z: number;
}

interface IVec4 {
    w: number;
    x: number;
    y: number;
    z: number;
}

interface IPlayerUpdate {
    entityId: string;
    position: IVec3;
    rotation: IVec4;
    velocity: IVec3;
    tribe?: number;
    animation?: string;
}

interface IPlayerMessage {
    topic: 'entity.transform.update';
    payload: IPlayerUpdate;
}

const DataFiles = Gets({
    character: '/content/character/character.toml',
    wall: '/content/tiles/wall.toml',
    sword: '/content/character/sword.toml',
    rain: '/content/character/rain.toml',
    old: '/content/character/old.toml',
    level: '/content/random/testlevel.toml',
    grass: '/content/tiles/grass.toml',
    dirt: '/content/tiles/dirt.toml',
    water: '/content/tiles/water.toml',
    tree: '/content/tiles/tree.toml',
    water2: '/content/tiles/water2.toml'
});

const tribes = [
    'character',
    'sword',
    'rain',
    'old'
];

const RandomTribe = () => tribes[Math.round(Math.random() * 3)];

export let current: Scene;
export default class Scene extends THREE.Scene {
    clock: THREE.Clock;
    send: (msg: any) => Promise<any>;
    player: Vox;
    uuid: string;
    players: { [key: string]: Vox };
    grassMap: any;
    waterMap: any;

    constructor(scenePromise: Promise<ISceneData>) {
        super();
        this.setupScene(scenePromise);
        this.clock = new THREE.Clock();
    }

    add(object: THREE.Object3D) {
        if(object instanceof Entity) {
            SystemManagerInst.addEntity(object);
        }
        super.add(object);
    }

    remove(object: THREE.Object3D) {
        if(object instanceof Entity) {
            SystemManagerInst.removeEntity(object);
        }
        super.remove(object);
    }

    async setupScene(scenePromise: Promise<ISceneData>) {
        const sceneData = await scenePromise;
        sceneData.entity = sceneData.entity || [];
        sceneData.def = sceneData.def || {};
        current = this;
        this.uuid = uuid.v4();
        this.players = {};

        this.add(new THREE.AmbientLight(0xFFFFFF, 0.55));
        const light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
        light.position.set(0, 5, 5);
        this.add(light);

        const LoadEntity = async (instanceData: IInstanceData) => {
            const data: any = { child: [] };

            const resolveFile = async (file) => {
                const fdata = await Get(`/${file}`);
                const childs = fdata.child || [];

                if(fdata.file) {
                    const subData = await resolveFile(fdata.file);
                    const subChilds = subData.child || [];
                    Object.assign(fdata, subData, { child: childs.concat(subChilds) });
                }

                return fdata;
            };

            if(instanceData.file) {
                Object.assign(data, await resolveFile(instanceData.file));
            }

            Object.assign(data, instanceData);
            const o3d = new Vox(data as IVoxData);

            if(data.child.length > 0) {
                for(let i = 0; i < data.child.length; i++) {
                    o3d.add(await LoadEntity(data.child[i]));
                }
            }

            return o3d;
        };

        (async () => {
            const ent = new Entity( {
                vox: DataFiles[RandomTribe()]
            });

            Object.assign(ent.userData, await Get('/content/controller/character.toml'));
            SystemManagerInst.getSystemByName("PlayerControllerSystem").setEntityAsLocalPlayer(ent);
            this.add(ent);
        }) ();

        sceneData.entity.forEach(async voxData => {
            this.add(await LoadEntity(voxData));
        });

        const handlePlayer = (playerUpdate: IPlayerUpdate) => {
            if (playerUpdate.entityId === this.uuid) return;

            if (!this.players[playerUpdate.entityId]) {
                const tribe = tribes[playerUpdate.tribe ? playerUpdate.tribe : Math.round(Math.random() * 3)];
                this.players[playerUpdate.entityId] = new Vox(DataFiles[tribe]);
                this.add(this.players[playerUpdate.entityId]);
            }

            const player = this.players[playerUpdate.entityId];

            const newPos = new THREE.Vector3();
            newPos.set(playerUpdate.position.x / 100, playerUpdate.position.z / 100, playerUpdate.position.y / 100);

            const rot = playerUpdate.rotation;
            const newRot = new THREE.Vector3(
                rot.x,
                rot.y,
                rot.z
            );

            player.position.lerp(newPos, 0.5);
            player.rotation.setFromVector3(newRot);

            // if(playerUpdate.animation && playerUpdate.animation !== player.current) {
            //     player.play(playerUpdate.animation);
            //     return;
            // }
        };

        this.createTiles();

        this.tick = this.tick.bind(this);
        this.tick();
    }

    async createTiles() {
        this.grassMap = {};
        this.waterMap = {};

        const grassTile = new Vox(DataFiles.grass);
        const dirtTile = new Vox(DataFiles.dirt);
        const waterTile = new Vox(DataFiles.water);
        const waterTile2 = new Vox(DataFiles.water2);

        await DataFiles.all;

        const tileModel = await grassTile.animations.idle.vox[0];
        const dirtModel = await dirtTile.animations.idle.vox[0];
        const waterModel = await waterTile.animations.idle.vox[0];
        const waterModel2 = await waterTile2.animations.idle.vox[0];

        for (let x = -20; x < 20; x++) {
            this.waterMap[x] = {};
            for (let y = -5; y < 20; y++) {
                const doWater = true;

                const tile = doWater ? waterModel.clone() : tileModel.clone();
                const tileD = doWater ? waterModel2.clone() : dirtModel.clone();

                tile.position.set(x, 0, y);
                tileD.position.set(x, 0, y);

                if (doWater) {
                    this.waterMap[x][y] = tile;
                    tile.material.opacity = 0.4;
                    tile.material.transparent = true;
                    tileD.position.set(x + 30, 0, y + 2);
                    tileD.material.opacity = 0.6;
                    tileD.material.transparent = true;

                    tile.origy = tile.position.y;
                } else {

                    const positionOffset =
                        (
                            Math.sin(x * 0.2)
                            + Math.cos(y * 0.8) * 0.1
                        ) * 0.5 - 0.05;
                    tile.position.y += positionOffset;
                    tileD.position.y += positionOffset;
                }
                tile.rotateY(THREE.Math.degToRad(Math.round(Math.random() * 3) * 90));
                tileD.rotateY(THREE.Math.degToRad(Math.round(Math.random() * 3) * 90));

                if (!doWater && Math.abs(x) % 20 < 4 && Math.abs(y) % 20 < 4) {
                    this.add(tileD);
                } else {
                    this.add(tile);
                    //this.add(tileD);
                }
            }
        }
    }

    tick() {
        requestAnimationFrame(this.tick);
        const time = Date.now();
        const delta = this.clock.getDelta();

        SystemManagerInst.update(delta);

        Object.keys(this.waterMap).forEach(xkey => {
            Object.keys(this.waterMap[xkey]).forEach(ykey => {
                const positionOffset =
                    (
                        Math.sin(time * 0.0005 + parseInt(xkey, 10) * 0.5) * 0.5
                        + Math.cos(time * 0.0005 + parseInt(ykey, 10) * 0.8) * 0.05
                    )
                    * 0.5 - 0.05;
                const tile = this.waterMap[xkey][ykey];
                tile.position.y = tile.origy + positionOffset;

                // this.waterMap[xkey][ykey].rotateY(THREE.Math.degToRad(Math.round(Math.random() * 3) * 90));
            });
        });
    }
}

current = new Scene(Get('../content/scene/default.toml'));
