import * as THREE from 'three';
import Vox, { IVoxData } from './vox';
import { Gets, Get } from '../engine/assets';
import { State, IEntity } from '../engine/state';

import CharacterController from '../systems/character-controller';
import {Render} from '../systems/render';
import * as uuid from 'uuid';

export let current: Scene;

export default class Scene extends THREE.Scene {
    clock: THREE.Clock;
    send: (msg: any) => Promise<any>;
    player: THREE.Object3D;
    players: { [key: string]: THREE.Object3D};
    state = new State({
        render: new Render()
    });

    constructor(scenePromise: Promise<IEntity>) {
        super();
        this.setupScene(scenePromise);
        this.clock = new THREE.Clock();
        (window as any).scene = this;
    }

    async WatchEntity(entity: IEntity) {
        const o3d = new THREE.Object3D();
        // only works one level deep
        this.state.watch(`${entity.id}`, async (entityUp) => {
            if(o3d.children.length) {
                o3d.remove(o3d.children[0]);
            }
            o3d.add(await this.CreateEntity(entityUp));
        });

        return o3d;
    }

    async CreateEntity(entity: IEntity) {
        const o3d = new Vox(entity as IVoxData);

        if(entity.has && Object.keys(entity.has).length > 0) {
            for(const childKey of Object.keys(entity.has)) {
                o3d.add(await this.WatchEntity(await this.state.get(`${entity.id}.${childKey}`)));
            }
        }

        return o3d;
    }

    async setupScene(scenePromise: Promise<IEntity>) {
        const sceneData = await scenePromise;
        current = this;
        this.players = {};

        this.add(new THREE.AmbientLight(0xFFFFFF, 0.80));
        const light = new THREE.DirectionalLight(0xFF9999, 0.5);
        light.position.set(0, 5, 5);
        this.add(light);

        this.state.set('player', {
            is: 'content/character/character.toml'
        });

        this.player = await this.WatchEntity(await this.state.get('player'));
        this.add(this.player);
        const controller = new CharacterController(this.player);

        Object.keys(sceneData.has).forEach(async key => {
            this.state.set(key, sceneData.has[key]);
            this.add(await this.WatchEntity(sceneData.has[key]));
        });
    }
}

current = new Scene(Get('../content/scene/default.toml'));
