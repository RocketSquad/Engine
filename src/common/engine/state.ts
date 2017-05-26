import {Asset} from './asset';
import {ISystem} from './system';

export interface IEntity {
    id?: string;
    is?: string;
    has?: {[key: string]: IEntity};
    [key: string]: any;
}

export interface IAction {
    type: string;
    [key: string]: any;
}

export interface IActionSet extends IAction {
    type: 'SET';
    // EntityId#ComponentPath
    path: string;
    // what to set it to
    data: any;
}

// tree1.apple#position

export const DoSet = (path: string, data: any): IActionSet => {
    return {
        type: 'SET',
        path,
        data
    };
};

const ResolvePath = (obj: any, path: string[]) => {
    const key = path.shift();
    let val = obj[key] !== undefined ? obj[key] : obj[key] = {};
    if(path.length > 1) {
        return ResolvePath(val, path);
    } else {
        return val;
    }
};

const HandleSet = (action: IActionSet, state: State) => {
    const [entityId, componentPath] = action.path.split('#');
    const comp = componentPath.split('.');
    const key = comp.pop();
    const entity = state.raw(entityId);
    let obj = entity;

    if(comp.length) {
        obj = ResolvePath(obj, comp);
    }

    obj[key] = action.data;

    state.set(entityId, entity);
};

// should be smart enough to do on('key.whatever')
// and wildcards
// should autohandle is updates
// should not handle has updates
// should handle reducers/have a set of reducers
export class State {
    private map = new Map<string, IEntity>();
    private systems: {[key: string]: ISystem};
    private components: {[key: string]: ISystem[]} = {};
    private clock = Date.now();
    private actions: {[key: string]: IAction} = {};

    constructor(systems: {[key: string]: ISystem}) {
        this.systems = systems;
        Object.keys(this.systems).forEach(sysKey => {
            const system = systems[sysKey];
            Object.keys(system.components).forEach(component => {
                this.components[component] = this.components[component] || [];
                this.components[component].push(system);
            });
            system.start(this);
        });

        this.tick = this.tick.bind(this);
        this.tick();
    }

    /* ACTION METHODS */
    consume(action: IAction) {

    }

    dispatch(action: IAction) {

    }


    /* LIFE CYCLE METHODS */
    get(key: string): Promise<IEntity> {
        return this.expandEntity(this.map.get(key));
    }

    // Make an entity including its templates
    raw(key: string) {
        return this.map.get(key);
    }

    rawSet(key: string, entity: IEntity) {
        entity.id = key;
        this.map.set(entity.id, entity);
    }

    async set(key: string, entity: IEntity) {
        // ensure
        entity.id = key;
        this.map.set(entity.id, entity);

        const exEntity = await this.get(entity.id);
        if(exEntity.has && Object.keys(exEntity.has).length > 0) {
            Object.keys(exEntity.has).forEach(hasKey => {
                // ensure key set
                this.set(`${key}.${hasKey}`, exEntity.has[hasKey]);
            });
        }

        // should only subscribe if is changes
        if(entity.is) {
            Asset.on(entity.is, async () => {
                this.fire(key);
            });
        }

        this.fire(key);

        return exEntity;
    }

    delete(key: IEntity | string) {
        if(typeof key === 'object') {
            key = key.id;
        }
        const data = this.raw(key);

        if(data && data.has && Object.keys(data.has).length > 0) {
            Object.keys(data.has).forEach(hasKey => this.delete(`${key}.${hasKey}`));
        }

        const ret = this.map.delete(key);

        this.fire(key, true);
        return ret;
    }

    toJSON() {
        const result = [];

        this.map.forEach((e, k) => {
            result.push([k, e]);
        });

        return result;
    }

    // Tick systems
    private tick() {
        requestAnimationFrame(this.tick);
        const now = Date.now();
        const delta = (now - this.clock) * 0.001;
        this.clock = now;

        Object.keys(this.systems).forEach(sysKey => {
            const system = this.systems[sysKey];
            system.tick(delta);
        });
    }

    // Inform systems about entities with components they have interest in
    private async fire(key: string, deleted = false) {
        const val = deleted ? undefined : await this.get(key);

        // we fire whenever shit changes...
        // good time to check to see if systems need updated
        // man do we need deltas
        Object.keys(this.systems).forEach(sysKey => {
            const system = this.systems[sysKey];
            const hasEntity = system.has(val);

            if(hasEntity && deleted) {
                return system.remove(val);
            }

            // delta changes would help this
            const hasComponent = Object.keys(system.components).some(component => {
                return val[component] !== undefined;
            });

            if(hasComponent && !hasEntity) {
                return system.add(val);
            }

            if(hasComponent && hasEntity) {
                return system.update(val);
            }

            if(!hasComponent && hasEntity) {
                return system.remove(val);
            }
        });
    }

    // Probably needs to be cached so we don't do this all the time
    private expandEntity(e: IEntity, expand = false) {
        return new Promise(async (resolve, reject) => {
            if(!e) reject(e);

            const data: IEntity = {has: {}};

            if(e.is) {
                // Get handles resolving is's
                Object.assign(data, await Asset.get(e.is), {is: undefined});
            }

            Object.assign(data, e, {
                has: Object.assign(data.has, e.has)
            });

            resolve(data);
        });
    }
}
