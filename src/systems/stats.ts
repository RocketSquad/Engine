import { ISystem } from '../systemManager';
import Entity from '../entity';
import * as THREE from "three";

export interface IStatsData {
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
        const stats = entity.userData as IStatsData;
        stats.health = stats.maxHealth;
        stats.stamina = stats.maxStamina;
    }

    remove(entity: Entity) {
        this.relativeEntities[entity.id] = undefined;
        const stats = entity.userData as IStatsData;
    }

    update(dt: number) {
        this.relativeEntities.forEach((e) => {
            const stats = e.userData as IStatsData;
         //   console.log(stats.health);
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
