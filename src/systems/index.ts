//import PhysicsSystem from './physicsSys';
import RenderingSystem from './rendering';
import PlayerControllerSystem from './playerController';

export const SystemConstructorList = {
    RenderingSystem: () => {return new RenderingSystem()},
    PlayerControllerSystem: () => {return new PlayerControllerSystem()},
}