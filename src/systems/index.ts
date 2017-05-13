//import PhysicsSystem from './physicsSys';
import RenderingSystem from './renderingSys';

export const SystemConstructorList = {
    RenderingSystem: () => {return new RenderingSystem()},
}