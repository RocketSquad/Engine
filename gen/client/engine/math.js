"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RMath = (function () {
    function RMath() {
    }
    RMath.SmallestAngleBetweenAngles = function (target, source) {
        var deltaAngle = (target - source);
        deltaAngle = (((deltaAngle + RMath.pi) % RMath.tau + RMath.tau) % RMath.tau) - RMath.pi;
        return deltaAngle;
    };
    return RMath;
}());
// Real men use radians
RMath.pi = 3.141592653;
RMath.tau = 2 * RMath.pi;
RMath.degreeToRad = RMath.pi / 180;
RMath.radToDegree = 180 / RMath.pi;
exports.default = RMath;
//# sourceMappingURL=math.js.map