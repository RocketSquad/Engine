import {IEntity, State} from './state';

export interface ISystem {
    Start: (state: State) => void;
    Stop?: () => void;
    Add: (entity: IEntity) => void;
    Remove: (entity: IEntity) => void;
    Tick?: (delta: number) => void;
}
