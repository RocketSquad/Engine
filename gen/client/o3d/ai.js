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
var rand = function () {
    return Math.random() - 0.5;
};
var Ai = (function (_super) {
    __extends(Ai, _super);
    function Ai(data) {
        var _this = _super.call(this, data) || this;
        _this.clock = new THREE.Clock();
        _this.newTarget();
        _this.tick();
        return _this;
    }
    Ai.prototype.newTarget = function () {
        this.lerp = 0;
        this.target = new THREE.Vector3(rand() * this.data.distance, 0, rand() * this.data.distance);
    };
    Ai.prototype.tick = function () {
        var delta = this.clock.getDelta();
        this.lerp += delta * this.data.speed;
        this.position.lerp(this.target, this.lerp);
        this.lookAt(this.target);
        if (this.lerp >= 1) {
            this.newTarget();
        }
        requestAnimationFrame(this.tick.bind(this));
    };
    return Ai;
}(vox_1.default));
exports.default = Ai;
//# sourceMappingURL=ai.js.map