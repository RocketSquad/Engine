import {Asset} from './asset';
import {ISystem} from './system';

export interface IEntity {
    id?: string;
    is?: string;
    has?: {[key: string]: IEntity};
    [key: string]: any;
}

export type FEntityUpdateHandler = (entity: IEntity) => void;

// should be smart enough to do on('key.whatever')
// and wildcards
// should autohandle is updates
// should not handle has updates
// should handle reducers/have a set of reducers
export class State {
    private handlers: {[key: string]: FEntityUpdateHandler[]} = {};
    private map = new Map<string, IEntity>();
    private systems: {[key: string]: ISystem};
    private components: {[key: string]: ISystem[]} = {};
    private clock = Date.now();

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

    off(key: string, fn: FEntityUpdateHandler) {
        const handlers = this.handlers[key] = this.handlers[key] || [];
        const idx = handlers.indexOf(fn);
        if(idx === -1) return false;
        handlers.splice(idx, 1);
        return true;
    }

    // needs to handle the IS chain
    on(key: string, fn: FEntityUpdateHandler) {
        const handlers = this.handlers[key] = this.handlers[key] || [];
        handlers.push(fn);
    }

    async watch(key: string, fn: FEntityUpdateHandler) {
        this.on(key, fn);
        fn(await this.get(key));
    }

    get(key: string): Promise<IEntity> {
        return this.expandEntity(this.map.get(key));
    }

    // Make an entity including its templates
    raw(key: string) {
        return this.map.get(key);
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
        delete this.handlers[key];
        return ret;
    }

    toJSON() {
        const result = [];

        this.map.forEach((e, k) => {
            result.push([k, e]);
        });

        return result;
    }

    private tick() {
        requestAnimationFrame(this.tick);
        const now = Date.now();
        const delta = now - this.clock;
        this.clock = now;

        Object.keys(this.systems).forEach(sysKey => {
            const system = this.systems[sysKey];
            system.tick(delta);
        });
    }

    private async fire(key: string, deleted = false) {
        const handlers = this.handlers[key] || [];
        const val = deleted ? undefined : await this.get(key);
        handlers.forEach(fn => fn(val));

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
