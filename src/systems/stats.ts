import { ISystem } from '../systemManager';
import Entity from '../entity';
import * as THREE from "three";

interface IStatsData {
    health: number;
    stamina: number;
    healthRegen: number;
    staminaRegen: number;
    maxHealth: number;
    maxStamina: number;
    dead: boolean;
}

export default class StatsSystem implements ISystem {
    relativeEntities: Entity[];

    constructor() {
        this.relativeEntities = [];
    }

    add(entity: Entity) {
        this.relativeEntities[entity.id] = entity;
    }

    remove(entity: Entity) {
        this.relativeEntities[entity.id] = undefined;
    }

    clamp(current: number, min: number, max: number): number {
        current = Math.min(current, max);
        current = Math.max(current, min);
        return current;
    }

    update(dt: number) {
        this.relativeEntities.forEach((e) => {
            const stats = e.userData as IStatsData;
            const alive = !stats.dead; //aka not dead
            if (alive) {
                stats.health += stats.healthRegen * dt;
                stats.stamina += stats.staminaRegen * dt;
                stats.health = THREE.Math.clamp(stats.health, 0, stats.maxHealth);
                stats.stamina = THREE.Math.clamp(stats.stamina, 0, stats.maxStamina);
            }
        });
    }
}
