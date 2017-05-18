"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require('uuid');
function addMissingDefaults(target, defaults) {
    for (var prop in defaults) {
        if (defaults[prop] && !target[prop]) {
            target[prop] = defaults[prop];
        }
    }
}
exports.addMissingDefaults = addMissingDefaults;
var SystemManager = (function () {
    function SystemManager() {
        this.systems = {};
        for (var sysType in SystemConstructorList) {
            console.log(sysType);
            this.systems[sysType] = SystemConstructorList[sysType]();
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
//# sourceMappingURL=index.js.map