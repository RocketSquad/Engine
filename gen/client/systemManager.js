"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var systems_1 = require("./systems");
var uuid = require('uuid');
var SystemManager = (function () {
    function SystemManager() {
        this.systems = {};
        for (var sysType in systems_1.SystemConstructorList) {
            console.log(sysType);
            this.systems[sysType] = systems_1.SystemConstructorList[sysType]();
        }
    }
    SystemManager.prototype.getSystemByName = function (sysType) {
        return this.systems[sysType];
    };
    SystemManager.prototype.addEntity = function (entity) {
        for (var prop in this.systems) {
            this.systems[prop].add(entity);
        }
    };
    SystemManager.prototype.removeEntity = function (entity) {
        for (var prop in this.systems) {
            this.systems[prop].remove(entity);
        }
    };
    SystemManager.prototype.update = function (dt) {
        for (var prop in this.systems) {
            this.systems[prop].update(dt);
        }
    };
    return SystemManager;
}());
exports.SystemManager = SystemManager;
exports.SystemManagerInst = new SystemManager();
//# sourceMappingURL=systemManager.js.map