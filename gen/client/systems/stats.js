"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var StatsSystem = (function () {
    function StatsSystem() {
        this.relativeEntities = [];
    }
    StatsSystem.prototype.add = function (entity) {
        this.relativeEntities[entity.id] = entity;
        var stats = entity.userData;
        stats.health = stats.maxHealth;
        stats.stamina = stats.maxStamina;
    };
    StatsSystem.prototype.remove = function (entity) {
        this.relativeEntities[entity.id] = undefined;
    };
    StatsSystem.prototype.clamp = function (current, min, max) {
        current = Math.min(current, max);
        current = Math.max(current, min);
        return current;
    };
    StatsSystem.prototype.dealDamage = function (entity, damage, dt) {
        var stats = entity.userData;
        stats.health -= damage * dt;
        if (stats.health < 0) {
            stats.health = 0;
            stats.dead = true;
        }
    };
    StatsSystem.prototype.useStamina = function (entity, stamina, dt) {
        var stats = entity.userData;
        stats.stamina -= stamina * dt;
        if (stats.stamina < 0) {
            stats.stamina = 0;
            stats.dead = true;
        }
    };
    StatsSystem.prototype.update = function (dt) {
        this.relativeEntities.forEach(function (e) {
            var stats = e.userData;
            // HACK / TODO - move this
            var hwnd = window;
            hwnd.hud.health = stats.stamina;
            // console.log(stats.health);
            var alive = !stats.dead; // aka not dead
            if (alive) {
                stats.health += stats.healthRegen * dt;
                stats.stamina += stats.staminaRegen * dt;
                stats.health = THREE.Math.clamp(stats.health, 0, stats.maxHealth);
                stats.stamina = THREE.Math.clamp(stats.stamina, 0, stats.maxStamina);
            }
        });
    };
    return StatsSystem;
}());
exports.default = StatsSystem;
//# sourceMappingURL=stats.js.map