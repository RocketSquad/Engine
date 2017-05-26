import {ISystem, System} from 'common/engine/system';
import {IEntity, State} from 'common/engine/state';

interface ITransformComponent {
    size?: number | number[];
    rotation?: number[];
    position?: number[];
}

export interface IBodyComponent {
    bb: number[];
}

export class Physics extends System {
    public components: {
        body: 'IBodyComponent'
    };
}
