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
var vox_1 = require("./vox");
var assets_1 = require("../engine/assets");
var entity_1 = require("../entity");
var uuid = require("uuid");
var systemManager_1 = require("../systemManager");
var DataFiles = {
    character: '/content/character/character.toml',
    wall: '/content/tiles/wall.toml',
    sword: '/content/character/sword.toml',
    rain: '/content/character/rain.toml',
    old: '/content/character/old.toml',
    level: '/content/random/testlevel.toml',
    grass: '/content/tiles/grass.toml',
    dirt: '/content/tiles/dirt.toml',
    water: '/content/tiles/water.toml',
    tree: '/content/tiles/tree.toml',
    water2: '/content/tiles/water2.toml'
};
var tribes = [
    'character',
    'sword',
    'rain',
    'old'
];
var RandomTribe = function () { return tribes[Math.round(Math.random() * 3)]; };
var Scene = (function (_super) {
    __extends(Scene, _super);
    function Scene(scenePromise) {
        var _this = _super.call(this) || this;
        _this.setupScene(scenePromise);
        _this.clock = new THREE.Clock();
        return _this;
    }
    Scene.prototype.add = function (object) {
        if (object instanceof entity_1.default) {
            systemManager_1.SystemManagerInst.addEntity(object);
        }
        _super.prototype.add.call(this, object);
    };
    Scene.prototype.remove = function (object) {
        if (object instanceof entity_1.default) {
            systemManager_1.SystemManagerInst.removeEntity(object);
        }
        _super.prototype.remove.call(this, object);
    };
    Scene.prototype.setupScene = function (scenePromise) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var sceneData, light, LoadEntity, handlePlayer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, scenePromise];
                    case 1:
                        sceneData = _a.sent();
                        sceneData.entity = sceneData.entity || [];
                        sceneData.def = sceneData.def || {};
                        exports.current = this;
                        this.uuid = uuid.v4();
                        this.players = {};
                        this.add(new THREE.AmbientLight(0xFFFFFF, 0.80));
                        light = new THREE.DirectionalLight(0xFF9999, 0.5);
                        light.position.set(0, 5, 5);
                        this.add(light);
                        LoadEntity = function (instanceData) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            var data, resolveFile, _a, _b, _c, o3d, i, _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        data = { child: [] };
                                        resolveFile = function (file) { return __awaiter(_this, void 0, void 0, function () {
                                            var fdata, childs, subData, subChilds;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, assets_1.Get("/" + file)];
                                                    case 1:
                                                        fdata = _a.sent();
                                                        childs = fdata.child || [];
                                                        if (!fdata.file) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, resolveFile(fdata.file)];
                                                    case 2:
                                                        subData = _a.sent();
                                                        subChilds = subData.child || [];
                                                        Object.assign(fdata, subData, { child: childs.concat(subChilds) });
                                                        _a.label = 3;
                                                    case 3: return [2 /*return*/, fdata];
                                                }
                                            });
                                        }); };
                                        if (!instanceData.file) return [3 /*break*/, 2];
                                        _b = (_a = Object).assign;
                                        _c = [data];
                                        return [4 /*yield*/, resolveFile(instanceData.file)];
                                    case 1:
                                        _b.apply(_a, _c.concat([_f.sent()]));
                                        _f.label = 2;
                                    case 2:
                                        Object.assign(data, instanceData);
                                        o3d = new vox_1.default(data);
                                        if (!(data.child.length > 0)) return [3 /*break*/, 6];
                                        i = 0;
                                        _f.label = 3;
                                    case 3:
                                        if (!(i < data.child.length)) return [3 /*break*/, 6];
                                        _e = (_d = o3d).add;
                                        return [4 /*yield*/, LoadEntity(data.child[i])];
                                    case 4:
                                        _e.apply(_d, [_f.sent()]);
                                        _f.label = 5;
                                    case 5:
                                        i++;
                                        return [3 /*break*/, 3];
                                    case 6: return [2 /*return*/, o3d];
                                }
                            });
                        }); };
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var ent, _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        ent = new entity_1.default({
                                            vox: DataFiles[RandomTribe()]
                                        });
                                        _b = (_a = Object).assign;
                                        _c = [ent.userData];
                                        return [4 /*yield*/, assets_1.Get('/content/controller/character.toml')];
                                    case 1:
                                        _b.apply(_a, _c.concat([_d.sent()]));
                                        systemManager_1.SystemManagerInst.getSystemByName("PlayerControllerSystem").setEntityAsLocalPlayer(ent);
                                        this.add(ent);
                                        return [2 /*return*/];
                                }
                            });
                        }); })();
                        sceneData.entity.forEach(function (voxData) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = this.add;
                                        return [4 /*yield*/, LoadEntity(voxData)];
                                    case 1:
                                        _a.apply(this, [_b.sent()]);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        handlePlayer = function (playerUpdate) {
                            if (playerUpdate.entityId === _this.uuid)
                                return;
                            if (!_this.players[playerUpdate.entityId]) {
                                var tribe = tribes[playerUpdate.tribe ? playerUpdate.tribe : Math.round(Math.random() * 3)];
                                _this.players[playerUpdate.entityId] = new vox_1.default(DataFiles[tribe]);
                                _this.add(_this.players[playerUpdate.entityId]);
                            }
                            var player = _this.players[playerUpdate.entityId];
                            var newPos = new THREE.Vector3();
                            newPos.set(playerUpdate.position.x / 100, playerUpdate.position.z / 100, playerUpdate.position.y / 100);
                            var rot = playerUpdate.rotation;
                            var newRot = new THREE.Vector3(rot.x, rot.y, rot.z);
                            player.position.lerp(newPos, 0.5);
                            player.rotation.setFromVector3(newRot);
                            // if(playerUpdate.animation && playerUpdate.animation !== player.current) {
                            //     player.play(playerUpdate.animation);
                            //     return;
                            // }
                        };
                        this.tick = this.tick.bind(this);
                        this.tick();
                        return [2 /*return*/];
                }
            });
        });
    };
    Scene.prototype.tick = function () {
        requestAnimationFrame(this.tick);
        var time = Date.now();
        var delta = this.clock.getDelta();
        systemManager_1.SystemManagerInst.update(delta);
    };
    return Scene;
}(THREE.Scene));
exports.default = Scene;
exports.current = new Scene(assets_1.Get('../content/scene/default.toml'));
//# sourceMappingURL=scene.js.map