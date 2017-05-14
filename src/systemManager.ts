import Entity from "./entity";
import {SystemConstructorList} from "./systems";
const uuid = require('uuid');

export interface ISystem {
    add(entity: Entity);
    remove(entity: Entity);

    update(dt: number);
}

export class SystemManager {
    systems: {[key: string]: ISystem};

    constructor() {
        this.systems = {};
        for(let sysType in SystemConstructorList) {
            console.log(sysType);
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
