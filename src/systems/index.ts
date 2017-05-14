import RenderingSystem from './rendering';
import StatsSystem from './stats';
import PlayerControllerSystem from './playerController';

export const SystemConstructorList = {
    RenderingSystem: () => new RenderingSystem(),
    PlayerControllerSystem: () => new PlayerControllerSystem(),
    StatsSystem: () => new StatsSystem()
};
