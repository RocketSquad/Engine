import * as THREE from 'three';
import {current} from './o3d/scene';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

(() => {
    const throttle = (type: string, name: string, obj?: any) => {
        obj = obj || window;
        let running = false;
        const func = () => {
            if (running) { return; }
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
};

window.addEventListener("optimizedResize", handleResize);

// Render Loop
const render = () => {
    requestAnimationFrame(render);
    renderer.render(current, camera);
};

document.body.appendChild(renderer.domElement);
render();
