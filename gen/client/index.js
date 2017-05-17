"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var scene_1 = require("./o3d/scene");
require("./interface.tsx");
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ antialias: true });
camera.position.set(0, 2, 0);
window.camera = camera;
(function () {
    var throttle = function (type, name, obj) {
        obj = obj || window;
        var running = false;
        var func = function () {
            if (running) {
                return;
            }
            running = true;
            requestAnimationFrame(function () {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };
    /* init - you can init any event */
    throttle("resize", "optimizedResize");
})();
var handleResize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
};
handleResize();
window.addEventListener("optimizedResize", handleResize);
// Render Loop
var render = function () {
    requestAnimationFrame(render);
    //var startTime = Date.now();
    renderer.render(scene_1.current, camera);
    var hwnd = window;
    hwnd.hud.renderFallback();
    //var elapsedTime = Date.now() - startTime;
    //document.getElementById("timer").innerHTML = (elapsedTime / 1000).toFixed(3);
};
document.body.appendChild(renderer.domElement);
render();
//# sourceMappingURL=index.js.map