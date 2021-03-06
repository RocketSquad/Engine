import {IEntity, State, IAction} from './state';

export interface ISystem {
    components: {[key: string]: string};
    start: (state: State) => void;
    stop: () => void;
    created: () => void;
    destroyed: () => void;
    add: (entity: IEntity) => void;
    remove: (entity: IEntity) => void;
    update: (entity: IEntity, component: string) => void;
    has: (entity: IEntity | string) => boolean;
    tick: (delta: number) => void;
}

export class System implements ISystem {
    public components: {[key: string]: string} = {};
    protected state: State;
    private entities: string[] = [];

    created() {
        // no-op
    }
    destroyed() {
        // no-op
    }

    start(state: State) {
        this.state = state;
        this.created();
    }

    stop() {
        // no-op
    }

    update(entity: IEntity, component: string) {
        const updateFn = this[`update_${component}`];
        if(updateFn) {
            updateFn.call(this, entity);
        }
    }

    add(entity: IEntity) {
        this.entities.push(entity.id);
    }

    remove(entity: IEntity) {
        this.entities.splice(this.entities.indexOf(entity.id), 1);
    }

    has(entity: IEntity | string) {
        const key = typeof entity === 'object' ? entity.id : entity;
        return this.entities.indexOf(key) !== -1;
    }

    tick(delta: number) {
        // no-op
    }

    dispatch(action: IAction, next = false) {
        action.from = this.constructor.name;
        this.state.dispatch(action, next);
    }
}
