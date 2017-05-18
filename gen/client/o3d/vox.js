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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var path = require("path");
var THREE = require("three");
var vox_1 = require("../engine/vox");
var assets_1 = require("../engine/assets");
var BuildVoxMesh = function (voxelBin, data) {
    var builder = new vox_1.MeshBuilder(voxelBin, {
        voxelSize: data.size,
        vertexColor: true,
        optimizeFaces: false,
        jitter: data.jitter
    });
    var mesh = builder.createMesh();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
};
var VoxModel = (function (_super) {
    __extends(VoxModel, _super);
    function VoxModel(voxData) {
        var _this = _super.call(this) || this;
        if (typeof voxData === 'string') {
            assets_1.On(voxData, _this.setVoxData.bind(_this));
            assets_1.Get(voxData);
        }
        else {
            _this.setVoxData(voxData);
        }
        return _this;
    }
    VoxModel.prototype.setVoxData = function (voxData) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var data, dir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.stop();
                        if (!(voxData instanceof Promise)) return [3 /*break*/, 2];
                        return [4 /*yield*/, voxData];
                    case 1:
                        data = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        data = voxData;
                        _a.label = 3;
                    case 3:
                        this.data = data;
                        dir = './vox';
                        this.animations = {};
                        data.jitter = data.jitter ? data.jitter : 0;
                        if (this.data.animation) {
                            Object.keys(this.data.animation).forEach(function (key) {
                                var anim = _this.data.animation[key];
                                _this.animations[key] = __assign({}, anim, { vox: anim.vox.map(function (file, i) {
                                        var filePath = path.join(dir, file);
                                        return assets_1.Get(filePath).then(function (voxelBin) {
                                            return BuildVoxMesh(voxelBin, data);
                                        });
                                    }) });
                                anim.vox.forEach(function (file, i) {
                                    var filePath = path.join(dir, file);
                                    assets_1.On(filePath, function (voxelBin) {
                                        _this.animations[key].vox[i] = Promise.resolve(BuildVoxMesh(voxelBin, data));
                                        if (_this.current) {
                                            _this.play(_this.current);
                                        }
                                    });
                                });
                            });
                        }
                        this.voxHolder = new THREE.Object3D();
                        if (data.position)
                            this.position.fromArray(data.position);
                        if (data.rotation)
                            this.rotation.fromArray(data.rotation.map(function (x) { return x * Math.PI / 180; }));
                        this.add(this.voxHolder);
                        if (this.data.default) {
                            this.play(this.data.default);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    VoxModel.prototype.play = function (animation) {
        if (this.timeout)
            clearInterval(this.timeout);
        this.current = animation;
        this.frame = 0;
        this.timeout = setInterval(this.step.bind(this), this.animations[animation].speed);
    };
    VoxModel.prototype.stop = function () {
        if (this.timeout)
            clearTimeout(this.timeout);
    };
    VoxModel.prototype.step = function () {
        return __awaiter(this, void 0, void 0, function () {
            var voxList, mesh;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.voxHolder.children[0])
                            this.voxHolder.remove(this.voxHolder.children[0]);
                        voxList = this.animations[this.current].vox;
                        return [4 /*yield*/, voxList[this.frame]];
                    case 1:
                        mesh = _a.sent();
                        this.voxHolder.add(mesh);
                        this.frame = this.frame + 1 === voxList.length ? this.frame = 0 : this.frame + 1;
                        return [2 /*return*/];
                }
            });
        });
    };
    return VoxModel;
}(THREE.Object3D));
exports.default = VoxModel;
//# sourceMappingURL=vox.js.map