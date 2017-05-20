/**
 * Handle input events from the mouse,
 * such as mouse button trigger/press/release
 * and mouse coordinates.
 */


export const mouse = {
    x: 0,
    y: 0,
    xp: 0,
    yp: 0,
    left: false,
    right: false,
};


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
