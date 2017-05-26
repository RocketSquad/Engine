import {ISystem, System} from 'common/engine/system';
import {IEntity, State} from 'common/engine/state';
const OIMO = require('oimo');

interface ITransformComponent {
    size?: number | number[];
    rotation?: number[];
    position?: number[];
}

const defaults: IBodyComponent = {
    mass: 1,
    size: [1, 1, 1]
};

export interface IBodyComponent {
    mass?: number;
    size?: number[];
    velocity?: number[];
}

export class Physics extends System {
    public components = {
        body: 'IBodyComponent'
    };

    private bodies: {[key: string]: any} = {};
    private world =  new OIMO.World({
        timestep: 1/60,
        iterations: 8,
        broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
        worldscale: 1, // scale full world 
        random: true,  // randomize sample
        info: false,   // calculate statistic or not
        gravity: [0,-98.0,0]
    });

    private entityCache: {[key: string]: IEntity} = {};

    add(entity: IEntity) {
        super.add(entity);
        this.entityCache[entity.id] = entity;

        const pos = [].concat(entity.position || [0, 0, 0]);
        const mass = entity.body.mass !== undefined ? entity.body.mass : 1;
        const size = [].concat(entity.body.size || [1, 1, 1]);

        const body = this.bodies[entity.id] = this.world.add({
            type: 'box', // type of shape : sphere, box, cylinder 
            size, // size of shape
            pos, // start position in degree
            rot: [0,0,0], // start rotation in degree
            move: mass > 0, // dynamic or statique
            density: mass + 1,
            friction: 0.2,
            restitution: 0,
            belongsTo: 1, // The bits of the collision groups to which the shape belongs.
            collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
        });

        console.log(body);
    }

    remove(entity: IEntity) {
        super.remove(entity);
        this.world.remove(this.bodies[entity.id]);
        delete this.bodies[entity.id];
        delete this.entityCache[entity.id];
    }

    update(entity: IEntity) {
        this.entityCache[entity.id] = entity;
        const body = this.bodies[entity.id];

        /*if(entity.position) {
            const pos = entity.position;
            body.pos.set(pos[0], pos[1], pos[2]);
        }*/
        if(entity.body.velocity) {
            const vel = entity.body.velocity;
            body.linearVelocity.set(vel[0], vel[1], vel[2]);
        }
        /*
        if(entity.body.mass !== undefined) {
            body.mass = entity.body.mass;
        }*/

    }

    tick(delta) {
        this.world.step();

        Object.keys(this.bodies).forEach(async key => {
            const entity = this.entityCache[key];
            const body = this.bodies[key];
            const pos = body.getPosition();

            entity.position = [pos.x, pos.y, pos.z];
            this.state.set(entity.id, entity);
        });
    }
}
