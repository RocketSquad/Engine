import Render from './rendering';
import Stats from './stats';
import Player from './controllers/player_controller';
import {ISystem} from './interfaces';

const uuid = require('uuid');

export function addMissingDefaults(target: {}, defaults: {}) {
    for(const prop in defaults) {
        if(defaults[prop] && !target[prop]) {
            target[prop] = defaults[prop];
        }
    }
}

export class SystemManager {
    systems: {[key: string]: ISystem};

    constructor() {
        this.systems = {};
        for(let sysType in SystemConstructorList) {
            this.systems[sysType] = SystemConstructorList[sysType]();
        }
    }

    getSystemByName(sysType: string): any {
        return this.systems[sysType];
    }

    addEntity(entity: Entity) {
        for(let prop in this.systems) {
            this.systems[prop].add(entity);
        }
    }

    removeEntity(entity: Entity) {
        for(let prop in this.systems) {
            this.systems[prop].remove(entity);
        }
    }

    update(dt: number) {
        for(let prop in this.systems) {
            this.systems[prop].update(dt);
        }
    }
}

export const SystemManagerInst = new SystemManager();
