"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vox_1 = require("../o3d/vox");
var RenderingSystem = (function () {
    function RenderingSystem() {
        this.vox = {};
        this.relativeEntities = {};
    }
    RenderingSystem.prototype.add = function (entity) {
        if (entity.userData['vox'] !== undefined) {
            this.vox[entity.id] = new vox_1.default(entity.userData['vox']);
            this.relativeEntities[entity.id] = entity;
            entity.add(this.vox[entity.id]);
        }
    };
    RenderingSystem.prototype.remove = function (entity) {
        this.vox[entity.id] = undefined;
        this.relativeEntities[entity.id] = undefined;
    };
    return RenderingSystem;
}());
exports.default = RenderingSystem;
//# sourceMappingURL=rendering.js.map