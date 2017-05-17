import Vox, {IAnimation, IVoxData} from './vox';
import * as THREE from 'three';

interface IAIData extends IVoxData {
    distance: number;
    speed: number;
}

const rand = () => {
    return Math.random() - 0.5;
};

export default class Ai extends Vox {
    data: IAIData;
    count: number;
    clock: THREE.Clock;
    target: THREE.Vector3;
    lerp: number;

    constructor(data: IAIData) {
        super(data);
        this.clock = new THREE.Clock();
        this.newTarget();

        this.tick();
    }

    newTarget() {
        this.lerp = 0;
        this.target = new THREE.Vector3(
            rand() * this.data.distance,
            0,
            rand() * this.data.distance,
        );
    }
    tick() {
        const delta = this.clock.getDelta();

        this.lerp += delta * this.data.speed;
        this.position.lerp(this.target, this.lerp);
        this.lookAt(this.target);

        if(this.lerp >= 1) {
            this.newTarget();
        }

        requestAnimationFrame(this.tick.bind(this));
    }
}
