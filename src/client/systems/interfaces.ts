export { default as Entity } from '../../shared/entity';
import Entity from '../../shared/entity';

export interface ISystem {
    add(entity: Entity);
    remove(entity: Entity);
    update(dt: number);
}
