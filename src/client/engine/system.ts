import {IEntity, State} from './state';

export interface ISystem {
    Start: (state: State) => void;
    Stop: () => void;
    Add: (entity: IEntity) => void;
    Remove: (entity: IEntity) => void;
    Has: (entity: IEntity) => boolean;
    Tick: (delta: number) => void;
}

export class System implements ISystem {
    private entities: string[] = [];
    private state: State;

    Start(state: State) {
        this.state = state;
    }

    Stop() {
        // no-op
    }
    
    Add(entity: IEntity) {
        this.entities.push(entity.id);
    }

    Remove(entity: IEntity) {
        this.entities.splice(this.entities.indexOf(entity.id), 1);
    }

    Has(entity: IEntity) {
        return this.entities.indexOf(entity.id) !== -1;
    }

    Tick(delta: number) {
        // no-op
    }
}
