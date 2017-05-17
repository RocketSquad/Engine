"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
// http://media.tojicode.com/webgl-samples/hud-test.html
var Hud = (function () {
    function Hud() {
    }
    Hud.prototype.renderFallback = function () {
        ReactDOM.render(React.createElement("div", null,
            React.createElement("div", { id: "health" },
                React.createElement("b", null, "Ba-dings:"),
                " ",
                hwnd.hud.ba_dings)), document.getElementById('hud'));
    };
    Hud.prototype.render = function () {
        ReactDOM.render(React.createElement("div", null,
            React.createElement("div", { id: "health" },
                React.createElement("b", null, "HP:"),
                " ",
                hwnd.hud.health),
            React.createElement("div", { id: "ammo" },
                React.createElement("b", null, "Ammo:"),
                " ",
                hwnd.hud.ammo,
                "/",
                hwnd.hud.clipSize),
            React.createElement("div", { id: "log" }, hwnd.hud.logObj.forEach(function (element) {
                React.createElement("div", null, element);
            }))), document.getElementById('hud'));
    };
    return Hud;
}());
var hwnd = window;
hwnd.hud = new Hud();
hwnd.hud.health = 7;
hwnd.hud.ammo = 50;
hwnd.hud.clipSize = 100;
hwnd.hud.logObj = ["abc", "def"];
hwnd.hud.ba_dings = 0;
//# sourceMappingURL=interface.js.map