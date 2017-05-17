"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var KeyLookUp = {
    13: 'enter',
    8: 'backspace',
    9: 'tab',
    17: 'ctrl',
    18: 'alt',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space'
};
window.addEventListener('blur', function (e) {
    Object.keys(exports.keys).forEach(function (k) {
        exports.keys[k] = false;
    });
});
window.addEventListener('gamepadconnected', function (e) {
    var index = e.gamepad.index;
    console.log("connection event for " + index);
    var gamepad = navigator.getGamepads()[index];
    exports.gamepads[index] = gamepad;
    console.log("end of connection event for " + index);
});
window.addEventListener('gamepaddisconnected', function (e) {
    console.log("disconnection event");
    var index = e.gamepad.index;
    delete exports.gamepads[index];
});
document.addEventListener('keyup', function (e) {
    var lookUp = KeyLookUp[e.keyCode];
    exports.keys[e.keyCode] = false;
    exports.keys[lookUp || e.key.toLowerCase()] = false;
});
document.addEventListener('keydown', function (e) {
    var lookUp = KeyLookUp[e.keyCode];
    exports.keys[e.keyCode] = true;
    exports.keys[lookUp || e.key.toLowerCase()] = true;
});
document.addEventListener('mousemove', function (e) {
    exports.mouse.x = e.clientX;
    exports.mouse.y = e.clientY;
    var w = window.innerWidth;
    var h = window.innerHeight;
    exports.mouse.xp = exports.mouse.x / w - .5;
    exports.mouse.yp = exports.mouse.y / h - .5;
});
document.addEventListener('mousedown', function (e) {
    exports.mouse.left = true;
});
document.addEventListener('mouseup', function (e) {
    exports.mouse.left = false;
});
exports.gamepads = [];
exports.keys = {};
exports.mouse = {
    x: 0,
    y: 0,
    xp: 0,
    yp: 0,
    left: false,
    right: false,
};
//# sourceMappingURL=input.js.map