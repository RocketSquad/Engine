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

const DataFiles = {
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
};

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

        this.add(new THREE.AmbientLight(0xFFFFFF, 0.80));
        const light = new THREE.DirectionalLight(0xFF9999, 0.5);
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

        this.tick = this.tick.bind(this);
        this.tick();
    }

    tick() {
        requestAnimationFrame(this.tick);
        const time = Date.now();
        const delta = this.clock.getDelta();

        SystemManagerInst.update(delta);
    }
}

current = new Scene(Get('../content/scene/default.toml'));
