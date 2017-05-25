import Vox, {IAnimation, IVoxData} from './vox';
import * as THREE from 'three';

interface IAmmoData extends IVoxData {
    speed: number;
    ttl: number;
    rate: number;
    spread: number;
}

interface IWeaponData extends IVoxData {
    ammo: IAmmoData;
}

export default class Weapon extends Vox {
    data: IWeaponData;
    ammo: Vox;
    spawned: THREE.Object3D[];
    count: number;
    clock: THREE.Clock;

    constructor(data: IWeaponData) {
        super(data);
        this.ammo = new Vox(this.data.ammo);
        this.spawned = [];
        this.clock = new THREE.Clock();

        this.tick();
    }

    fire() {
        const shell = new THREE.Object3D();
        shell.copy(this.ammo);
        shell.position.copy(this.parent.position);
        shell.rotation.copy(this.parent.rotation);
        shell.position.y += (Math.random() - 0.5) * this.data.ammo.spread;
        this.spawned.push(shell);

        (window as any).scene.add(shell);
    }

    tick() {
        const delta = this.clock.getDelta();
        this.spawned.forEach(shell => {
            shell.translateZ(this.data.ammo.speed * delta);
        });

        requestAnimationFrame(this.tick.bind(this));
    }
}
