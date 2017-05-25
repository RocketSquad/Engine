import {IEntity, State} from './state';

export interface ISystem {
    start: (state: State) => void;
    stop: () => void;
    created: () => void;
    destroyed: () => void;
    add: (entity: IEntity) => void;
    remove: (entity: IEntity) => void;
    has: (entity: IEntity) => boolean;
    tick: (delta: number) => void;
}

export class System implements ISystem {
    private entities: string[] = [];
    private state: State;

    created() {}
    destroyed() {}

    start(state: State) {
        this.state = state;
        this.created();
    }

    stop() {
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
