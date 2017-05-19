"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const vox_1 = require("./vox");
const assets_1 = require("../engine/assets");
const state_1 = require("../engine/state");
const character_controller_1 = require("../systems/controllers/character-controller");
class Scene extends THREE.Scene {
    constructor(scenePromise) {
        super();
        this.state = new state_1.State();
        this.setupScene(scenePromise);
        this.clock = new THREE.Clock();
        window.scene = this;
    }
    async WatchEntity(entity) {
        const o3d = new THREE.Object3D();
        // only works one level deep
        this.state.watch(`${entity.id}`, async (entityUp) => {
            if (o3d.children.length) {
                o3d.remove(o3d.children[0]);
            }
            o3d.add(await this.CreateEntity(entityUp));
        });
        return o3d;
    }
    async CreateEntity(entity) {
        const o3d = new vox_1.default(entity);
        if (entity.has && Object.keys(entity.has).length > 0) {
            for (const childKey of Object.keys(entity.has)) {
                o3d.add(await this.WatchEntity(await this.state.get(`${entity.id}.${childKey}`)));
            }
        }
        return o3d;
    }
    async setupScene(scenePromise) {
        const sceneData = await scenePromise;
        exports.current = this;
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
        const controller = new character_controller_1.default(this.player);
        Object.keys(sceneData.has).forEach(async (key) => {
            this.state.set(key, sceneData.has[key]);
            this.add(await this.WatchEntity(sceneData.has[key]));
        });
    }
}
exports.default = Scene;
exports.current = new Scene(assets_1.Get('../content/scene/default.toml'));
