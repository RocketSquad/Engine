//import PhysicsSystem from './physicsSys';
import RenderingSystem from './rendering';

export const SystemConstructorList = {
    RenderingSystem: () => {return new RenderingSystem()},
}