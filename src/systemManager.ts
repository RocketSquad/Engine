import Entity from "./entity";
import {SystemConstructorList} from "./systems";
const uuid = require('uuid');

export interface ISystem {
    add(entity: Entity);
    remove(entity: Entity);

    update(dt: number);
}

export class SystemManager {
    systems: ISystem[];

    constructor() {
        this.systems = [];
        for(let sysType in SystemConstructorList) {
            console.log(sysType);
            this.systems.push(SystemConstructorList[sysType]());
        }
    }

    addEntity(entity: Entity) {
        this.systems.forEach(sys => {
            sys.add(entity);
        });
    }

    removeEntity(entity: Entity) {
        this.systems.forEach(sys => {
            sys.remove(entity);
        });
    }

    update(dt: number) {
        this.systems.forEach(sys => {
            sys.update(dt);
        });
    }
}

export const SystemManagerInst = new SystemManager();
