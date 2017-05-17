"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var input_1 = require("../engine/input");
var assets_1 = require("../engine/assets");
var dataPromise = assets_1.Get('../content/controller/character.toml');
var data;
var CharacterController = (function () {
    function CharacterController(target) {
        this.target = target;
        this.tick = this.tick.bind(this);
        this.setup();
    }
    CharacterController.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dataPromise];
                    case 1:
                        data = _a.sent();
                        this.clock = new THREE.Clock();
                        this.target.position.set(0, 0, -5);
                        this.tick();
                        return [2 /*return*/];
                }
            });
        });
    };
    CharacterController.prototype.tick = function () {
        var delta = this.clock.getDelta();
        var forward = 0;
        var turn = 0;
        var up = 0;
        requestAnimationFrame(this.tick);
        if (input_1.keys.w)
            forward = 1;
        if (input_1.keys.s)
            forward = -1;
        if (input_1.keys.d)
            turn = -1;
        if (input_1.keys.a)
            turn = 1;
        if (input_1.keys.x)
            up = 1;
        if (input_1.keys.c)
            up = -1;
        this.target.rotateY(turn * delta * data.turnSpeed);
        this.target.translateZ(forward * delta * data.forwardSpeed);
        this.target.translateY(up * delta * data.forwardSpeed);
        var walking = forward !== 0 || turn !== 0;
        if (walking && this.target.current !== 'walk') {
            this.target.play('walk');
        }
        else if (!walking && this.target.current !== 'idle') {
            this.target.play('idle');
        }
        if (window.camera) {
            var cam = window.camera;
            var axis = new THREE.Vector3().fromArray(data.cameraLookAt);
            // axis.applyQuaternion(this.target.quaternion);
            var dstPosition = this.target.position.clone().add(axis);
            var camPosition = this.target.position.clone().add(new THREE.Vector3().fromArray(data.cameraOffset));
            cam.position.lerp(camPosition, data.cameraLerp);
            cam.lookAt(dstPosition);
        }
    };
    return CharacterController;
}());
exports.default = CharacterController;
//# sourceMappingURL=character-controller.js.map