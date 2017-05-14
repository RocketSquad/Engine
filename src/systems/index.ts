//import PhysicsSystem from './physicsSys';
import RenderingSystem from './rendering';
import StatsSystem from './stats';
export const SystemConstructorList = {
    RenderingSystem: () => {return new RenderingSystem()},
    StatsSystem: () => {return new StatsSystem()},
}