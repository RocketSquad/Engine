"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KeyLookUp = {
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
window.addEventListener('blur', (e) => {
    Object.keys(exports.keys).forEach((k) => {
        exports.keys[k] = false;
    });
});
window.addEventListener('gamepadconnected', e => {
    const index = e.gamepad.index;
    console.log("connection event for " + index);
    const gamepad = navigator.getGamepads()[index];
    exports.gamepads[index] = gamepad;
    console.log("end of connection event for " + index);
});
window.addEventListener('gamepaddisconnected', e => {
    console.log("disconnection event");
    const index = e.gamepad.index;
    delete exports.gamepads[index];
});
document.addEventListener('keyup', (e) => {
    const lookUp = KeyLookUp[e.keyCode];
    exports.keys[e.keyCode] = false;
    exports.keys[lookUp || e.key.toLowerCase()] = false;
});
document.addEventListener('keydown', (e) => {
    const lookUp = KeyLookUp[e.keyCode];
    exports.keys[e.keyCode] = true;
    exports.keys[lookUp || e.key.toLowerCase()] = true;
});
document.addEventListener('mousemove', e => {
    exports.mouse.x = e.clientX;
    exports.mouse.y = e.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;
    exports.mouse.xp = exports.mouse.x / w - .5;
    exports.mouse.yp = exports.mouse.y / h - .5;
});
document.addEventListener('mousedown', e => {
    exports.mouse.left = true;
});
document.addEventListener('mouseup', e => {
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
