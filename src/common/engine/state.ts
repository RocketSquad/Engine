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
    from?: string;
    [key: string]: any;
}

export interface IActionSet extends IAction {
    type: 'SET';
    entityId: string;
    component: string;
    // what to set it to
    data: any;
}

export const DoSet = (entityId: string, component: string, data: any): IActionSet => {
    if(['is', 'has'].indexOf(component) !== -1) {
        throw Error('Don\'t use Set Action for setting is/has, only components');
    }

    return {
        type: 'SET',
        component,
        entityId,
        data
    };
};

const HandleSet = (state: State, action: IActionSet) => {
    const entity = state.raw(action.entityId);
    entity[action.component] = action.data;
    state.set(action.entityId, entity);
    state.fireComponent(action.entityId, action.component);
};

export class State {
    public actions = new Map<string, IAction[]>();
    public nextActions = new Map<string, IAction[]>();
    private map = new Map<string, IEntity>();
    private systems: {[key: string]: ISystem};
    private components: {[key: string]: ISystem[]} = {};
    private clock = Date.now();
    public running = true;

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

    dispatch(action: IAction, next = false) {
        const actionMap = next ? this.nextActions : this.actions;
        let actions;
        if(!actionMap.has(action.type)) {
            actions = [];
        } else {
            actions = actionMap.get(action.type);
        }

        if(action.type === 'SET' && !next) {
            const set = (action as IActionSet);
            HandleSet(this, set);
        }

        actions.push(action);
        actionMap.set(action.type, actions);
    }

    /* LIFE CYCLE METHODS */
    get(key: string): Promise<IEntity> {
        return this.expandEntity(this.map.get(key));
    }

    // Make an entity including its templates
    raw(key: string) {
        return this.map.get(key);
    }

    // Set an entities data
    set(key: string, entity: IEntity) {
        entity.id = key;
        this.map.set(entity.id, entity);
    }

    clear() {
        this.stop();
        this.actions.clear();
        this.nextActions.clear();

        const promises = [];
        this.map.forEach((entity, key) => {
            promises.push(this.delete(key));
        });

        return Promise.all(promises).then(() => {
            this.start();
        });
    }

    start() {
        this.running = true;
    }

    stop() {
        this.running = false;
    }

    // Load and upgrade entities
    async load(key: string, entity: IEntity) {
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

    delete(entity: IEntity | string) {
        const key = typeof entity === 'object' ? entity.id : entity;
        const data = this.raw(key);

        if(data && data.has && Object.keys(data.has).length > 0) {
            Object.keys(data.has).forEach(hasKey => this.delete(`${key}.${hasKey}`));
        }

        return this.fire(key, true).then(() => {
            this.map.delete(key);
        });
    }

    toJSON() {
        const result = [];

        this.map.forEach((e, k) => {
            result.push([k, e]);
        });

        return result;
    }

    public async fireComponent(entityId: string, component: string) {
        const entity = await this.get(entityId);
        Object.keys(this.systems).forEach(sysKey => {
            const system = this.systems[sysKey];
            const hasEntity = system.has(entity);
            const hasComponent = system.components[component] !== undefined;

            if(hasComponent && !hasEntity) {
                return system.add(entity);
            }

            if(hasEntity && hasComponent) {
                return system.update(entity, component);
            }
        });
    }

    // Tick systems
    private tick() {
        requestAnimationFrame(this.tick);
        const now = Date.now();
        const delta = (now - this.clock) * 0.001;
        this.clock = now;
        if(!this.running) return;

        Object.keys(this.systems).forEach(sysKey => {
            const system = this.systems[sysKey];
            system.tick(delta);
        });

        // clear old actions, use next actions
        this.actions.clear();
        const flipAction = this.actions;
        this.actions = this.nextActions;
        this.nextActions = flipAction;

        if(this.actions.has('SET')) {
            const setActions = this.actions.get('SET');
            setActions.forEach(HandleSet.bind(null, this));
        }
    }

    // Inform systems about entities with components they have interest in
    private async fire(key: string, deleted = false) {
        const val = await this.get(key);
        // don't do this in prod
        const entity = Object.assign({}, val);

        Object.keys(this.systems).forEach(sysKey => {
            const system = this.systems[sysKey];
            const hasEntity = system.has(key);

            if(hasEntity && deleted) {
                return system.remove(val);
            }

            // delta changes would help this
            const hasComponent = Object.keys(system.components).some(component => {
                return val[component] !== undefined;
            });

            if(hasComponent && !hasEntity) {
                return system.add(entity);
            }

            if(hasComponent && hasEntity) {
                // HARD RESET
                system.remove(entity);
                system.add(entity);
                return;
            }

            if(!hasComponent && hasEntity) {
                return system.remove(entity);
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
