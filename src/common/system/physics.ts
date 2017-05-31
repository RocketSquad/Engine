import {ISystem, System} from 'common/engine/system';
import {IEntity, State} from 'common/engine/state';
import * as CANNON from 'cannon';

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

const fixedTimeStep = 1.0 / 60.0; // seconds
const  maxSubSteps = 3;

export class Physics extends System {
    public components = {
        body: 'IBodyComponent'
    };

    private bodies: {[key: string]: CANNON.Body} = {};
    private world = new CANNON.World();

    start(state) {
        super.start(state);
        this.world.gravity.set(0, -98.0, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.broadphase.useBoundingBoxes = true;
    }

    add(entity: IEntity) {
        super.add(entity);
        const pos = (entity.position || [0, 0, 0]);
        const mass = entity.body.mass !== undefined ? entity.body.mass : 1;
        const body = this.bodies[entity.id] = new CANNON.Body({
            mass,
            position: new CANNON.Vec3(pos[0], pos[1], pos[2])
        });

        const size = (entity.body.size || [1, 1, 1]);
        body.addShape(new CANNON.Box(new CANNON.Vec3(size[0], size[1], size[2])));
        this.world.addBody(body);
    }

    remove(entity: IEntity) {
        super.remove(entity);
        this.world.remove(this.bodies[entity.id]);
        delete this.bodies[entity.id];
    }

    update(entity: IEntity) {
        if(entity.position) {
            const pos = entity.position;
            this.bodies[entity.id].position.set(pos[0], pos[1], pos[2]);
        }
        if(entity.body.velocity) {
            const vel = entity.body.velocity;
            this.bodies[entity.id].velocity.set(vel[0], vel[1], vel[2]);
        }
        if(entity.body.mass !== undefined) {
            this.bodies[entity.id].mass = entity.body.mass;
        }

    }

    tick(delta) {
        this.world.step(fixedTimeStep, delta, maxSubSteps);

        Object.keys(this.bodies).forEach(async key => {
            const entity = await this.state.get(key);
            const body = this.bodies[key];

            entity.position = [body.position.x, body.position.y, body.position.z];
            this.state.set(entity.id, entity);
        });
    }
}
