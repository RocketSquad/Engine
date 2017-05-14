//import PhysicsSystem from './physicsSys';
import RenderingSystem from './rendering';
import StatsSystem from './stats';
import PlayerControllerSystem from './playerController';

export const SystemConstructorList = {
    RenderingSystem: () => {return new RenderingSystem()},
    PlayerControllerSystem: () => {return new PlayerControllerSystem()},
    StatsSystem: () => {return new StatsSystem()},
}
