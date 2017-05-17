
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
    Object.keys(keys).forEach( (k) => {
         keys[k] = false;
     });
});



window.addEventListener('gamepadconnected', e => {
    const index = (e as any).gamepad.index;
    console.log("connection event for " + index);
    const gamepad = navigator.getGamepads()[index];
    gamepads[index] = gamepad;
    console.log("end of connection event for " + index);
});

window.addEventListener('gamepaddisconnected', e => {
    console.log("disconnection event");
    const index = (e as any).gamepad.index;
    delete gamepads[index];
});

document.addEventListener('keyup', (e) => {
    const lookUp = KeyLookUp[e.keyCode];

    keys[e.keyCode] = false;
    keys[lookUp || e.key.toLowerCase()] = false;
});

document.addEventListener('keydown', (e) => {
    const lookUp = KeyLookUp[e.keyCode];

    keys[e.keyCode] = true;
    keys[lookUp || e.key.toLowerCase()] = true;
});

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const w = window.innerWidth;
    const h = window.innerHeight;

    mouse.xp = mouse.x / w - .5;
    mouse.yp = mouse.y / h - .5;
});

document.addEventListener('mousedown', e => {
    mouse.left = true;
});

document.addEventListener('mouseup', e => {
    mouse.left = false;
});

export const gamepads: Gamepad[] = [];
export const keys: {[key: string]: boolean} = {};
export const mouse = {
    x: 0,
    y: 0,
    xp: 0,
    yp: 0,
    left: false,
    right: false,
};
