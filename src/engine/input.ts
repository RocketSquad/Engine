document.addEventListener('keyup', (e) => {
    keys[e.keyCode] = false;
    keys[e.key] = false;
});

document.addEventListener('keydown', (e) => {
    keys[e.keyCode] = true;
    keys[e.key] = true;
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

export const keys: {[key: string]: boolean} = {};
export const mouse = {
    x: 0,
    y: 0,
    xp: 0,
    yp: 0,
    left: false,
    right: false,
};
