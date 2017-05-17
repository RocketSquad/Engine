"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var systemManager_1 = require("../systemManager");
var entity_1 = require("../entity");
var assets_1 = require("../engine/assets");
var THREE = require("three");
var input_1 = require("../engine/input");
var math_1 = require("../engine/math");
var Howl = require("howler");
var scene_1 = require("../o3d/scene");
var voice_1 = require("../engine/voice");
var soundFired = false;
var sound = new Howl.Howl({
    src: ['./sfx/sacktap.wav'],
    volume: 0.4,
    onend: function () {
        soundFired = false;
    },
});
var coinGet = assets_1.Get('./content/ammo/coin.toml');
var PlayerControllerSystem = (function () {
    function PlayerControllerSystem() {
        this.relativeEntities = [];
        this.clock = new THREE.Clock();
        this.cooldown = Math.floor(Math.random() * 10);
        this.data = {
            cameraLookAt: [0, 2, -1],
            cameraOffset: [0, 4, 3],
            cameraLerp: 1,
        };
    }
    PlayerControllerSystem.prototype.add = function (entity) {
        if (entity.userData.controller !== undefined) {
            entity.position.set(0, 0, 7);
            this.relativeEntities[entity.id] = entity;
            this.target = entity;
            entity.userData.controller.isLocalPlayer = false;
            entity.userData.controller.minInputLength = 0.3;
            entity.userData.controller.minRotAngle = 0.1;
        }
    };
    PlayerControllerSystem.prototype.remove = function (entity) {
        this.relativeEntities[entity.id] = undefined;
    };
    PlayerControllerSystem.prototype.setEntityAsLocalPlayer = function (entity) {
        this.target = entity;
        entity.userData.controller.isLocalPlayer = true;
    };
    PlayerControllerSystem.prototype.getControllerInput = function () {
        var forward = 0;
        var turn = 0;
        var up = 0;
        if (input_1.keys.w)
            forward = 1;
        if (input_1.keys.s)
            forward = -1;
        if (input_1.keys.d)
            turn = 1;
        if (input_1.keys.a)
            turn = -1;
        if (input_1.keys.x)
            up = 1;
        if (input_1.keys.c)
            up = -1;
        var gp = navigator.getGamepads()[0];
        if (gp) {
            forward = -gp.axes[1];
            if (Math.abs(forward) < 0.1)
                forward = 0;
            turn = gp.axes[0];
            if (Math.abs(turn) < 0.1)
                turn = 0;
        }
        return new THREE.Vector3(turn, up, -forward);
    };
    PlayerControllerSystem.prototype.getControllerDirection = function () {
        var forward = 0;
        var turn = 0;
        if (input_1.keys[38])
            forward = 1;
        if (input_1.keys[40])
            forward = -1;
        if (input_1.keys[37])
            turn = -1;
        if (input_1.keys[39])
            turn = 1;
        var gp = navigator.getGamepads()[0];
        if (gp) {
            forward = -gp.axes[3];
            turn = gp.axes[2];
        }
        return new THREE.Vector3(turn, 0, -forward);
    };
    PlayerControllerSystem.prototype.update = function (dt) {
        var _this = this;
        var delta = this.clock.getDelta();
        this.relativeEntities.forEach(function (entity) {
            var controller = entity.userData.controller;
            var input = _this.getControllerInput();
            if (input_1.keys.w || input_1.keys.s || input_1.keys.d || input_1.keys.a) {
                var statSystem = systemManager_1.SystemManagerInst.getSystemByName("StatsSystem");
                statSystem.useStamina(entity, 50, dt);
            }
            var direction = _this.getControllerDirection();
            var stats = entity.userData;
            if (stats.dead) {
                direction = new THREE.Vector3(0, 0, 0);
                input = new THREE.Vector3(0, 0, 0);
            }
            entity.position.add(input.multiplyScalar(entity.userData.controller.moveSpeed * dt));
            // Use input for direction if no direction is given
            if (direction.lengthSq() <= controller.minInputLength * controller.minInputLength) {
                direction = input;
            }
            // Calculate and handle rotation
            if (direction.lengthSq() > controller.minInputLength * controller.minInputLength) {
                var targetRotationAngle = new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0);
                var currentRotationAngle = new THREE.Euler().copy(entity.rotation);
                var deltaAngle = math_1.default.SmallestAngleBetweenAngles(targetRotationAngle.y, currentRotationAngle.y);
                deltaAngle *= math_1.default.radToDegree;
                var rotDir = void 0;
                if (Math.abs(deltaAngle) > controller.minRotAngle) {
                    rotDir = deltaAngle / Math.abs(deltaAngle);
                }
                else {
                    rotDir = 0;
                }
                var currentRot = currentRotationAngle.y * math_1.default.radToDegree;
                var nextDeltaRot = rotDir * Math.min(dt * controller.rotSpeed, Math.abs(deltaAngle));
                var nextAngle = ((currentRot + nextDeltaRot) % 360 + 360) % 360;
                currentRotationAngle.y = Math.min(nextAngle * math_1.default.degreeToRad);
                entity.rotation.copy(currentRotationAngle);
            }
        });
        if (window.camera && this.target) {
            var cam = window.camera;
            var axis = new THREE.Vector3().fromArray(this.data.cameraLookAt);
            var dstPosition = this.target.position.clone().add(axis);
            var camPosition = this.target.position.clone().add(new THREE.Vector3().fromArray(this.data.cameraOffset));
            cam.position.lerp(camPosition, this.data.cameraLerp);
            cam.lookAt(dstPosition);
        }
        var phrases = [
            'I like pina coladas, getting lost inthe rain',
            'Jurassic Fallback 2',
            'More money, more',
            'See you later alligator, work that tail',
            'I like pinya coladas',
            'Those moves are Jurra sick',
            'Let me show you my Cambrian explosion',
            'Jurassic Park that ass over here',
            'Grind that pole until you are dinosaur'
        ];
        // Space to play sounds!!
        if (input_1.keys[32] && !soundFired) {
            this.cooldown--;
            if (this.cooldown < 1) {
                voice_1.SayIt(phrases[Math.round(Math.random() * (phrases.length - 1))]);
                this.cooldown = 5 + Math.floor(Math.random() * 10);
            }
            var pitchShift = 4; // 4 percent random rate/pitch modulation
            sound.rate(Math.random() * pitchShift / 100 + 1.0 - (pitchShift / 100 / 2));
            sound.play();
            soundFired = true;
            coinGet.then(function (data) {
                var coin = new entity_1.default({
                    vox: data,
                });
                scene_1.current.add(coin);
                coin.position.copy(new THREE.Vector3((Math.random() * 20) - 10, Math.random() * 0.3, (Math.random() * 10) - 5));
            });
            var hwnd = window;
            hwnd.hud.ba_dings++;
        }
    };
    return PlayerControllerSystem;
}());
exports.default = PlayerControllerSystem;
//# sourceMappingURL=playerController.js.map