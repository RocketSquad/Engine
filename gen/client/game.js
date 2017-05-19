"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const scene_1 = require("./o3d/scene");
require("./ui/interface.tsx");
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
camera.position.set(0, 2, 0);
window.camera = camera;
(() => {
    const throttle = (type, name, obj) => {
        obj = obj || window;
        let running = false;
        const func = () => {
            if (running) {
                return;
            }
            running = true;
            requestAnimationFrame(() => {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };
    /* init - you can init any event */
    throttle("resize", "optimizedResize");
})();
const handleResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
};
handleResize();
window.addEventListener("optimizedResize", handleResize);
// Render Loop
const render = () => {
    requestAnimationFrame(render);
    renderer.render(scene_1.current, camera);
};
document.body.appendChild(renderer.domElement);
render();
