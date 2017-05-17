"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var vox_1 = require("./vox");
var THREE = require("three");
var Weapon = (function (_super) {
    __extends(Weapon, _super);
    function Weapon(data) {
        var _this = _super.call(this, data) || this;
        _this.ammo = new vox_1.default(_this.data.ammo);
        _this.spawned = [];
        _this.clock = new THREE.Clock();
        _this.tick();
        return _this;
    }
    Weapon.prototype.fire = function () {
        var shell = new THREE.Object3D();
        shell.copy(this.ammo);
        shell.position.copy(this.parent.position);
        shell.rotation.copy(this.parent.rotation);
        shell.position.y += (Math.random() - 0.5) * this.data.ammo.spread;
        this.spawned.push(shell);
        window.scene.add(shell);
    };
    Weapon.prototype.tick = function () {
        var _this = this;
        var delta = this.clock.getDelta();
        this.spawned.forEach(function (shell) {
            shell.translateZ(_this.data.ammo.speed * delta);
        });
        requestAnimationFrame(this.tick.bind(this));
    };
    return Weapon;
}(vox_1.default));
exports.default = Weapon;
//# sourceMappingURL=weapon.js.map