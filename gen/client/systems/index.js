"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rendering_1 = require("./rendering");
var stats_1 = require("./stats");
var playerController_1 = require("./playerController");
exports.SystemConstructorList = {
    RenderingSystem: function () { return new rendering_1.default(); },
    PlayerControllerSystem: function () { return new playerController_1.default(); },
    StatsSystem: function () { return new stats_1.default(); }
};
//# sourceMappingURL=index.js.map