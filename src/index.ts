import * as THREE from 'three';
import {current} from './o3d/scene';

interface IWindowGame extends Window {
    camera: THREE.Camera;
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

camera.position.set(0, 2, 0);

(window as IWindowGame).camera = camera;

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
}) ();

const handleResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
};

handleResize();
window.addEventListener("optimizedResize", handleResize);

// Render Loop
const render = () => {
    requestAnimationFrame(render);
    renderer.render(current, camera);
};

document.body.appendChild(renderer.domElement);
render();
