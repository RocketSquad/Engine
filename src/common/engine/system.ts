import {IEntity, State} from './state';

export interface ISystem {
    components: {[key: string]: string};
    start: (state: State) => void;
    stop: () => void;
    created: () => void;
    destroyed: () => void;
    add: (entity: IEntity) => void;
    remove: (entity: IEntity) => void;
    update: (entity: IEntity) => void;
    has: (entity: IEntity) => boolean;
    tick: (delta: number) => void;
}

export class System implements ISystem {
    public components: {[key: string]: string} = {};
    protected state: State;
    private entities: string[] = [];

    created() {}
    destroyed() {}

    start(state: State) {
        this.state = state;
        this.created();
    }

    stop() {
        // no-op
    }
    
    update(entity: IEntity) {
        // no-op
    }

    add(entity: IEntity) {
        this.entities.push(entity.id);
    }

    remove(entity: IEntity) {
        this.entities.splice(this.entities.indexOf(entity.id), 1);
    }

    has(entity: IEntity) {
        return this.entities.indexOf(entity.id) !== -1;
    }

    tick(delta: number) {
        // no-op
    }
}
