"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('connecting to ', location.toString());
var ws = new WebSocket('ws://localhost:8080');
var handlerId = 0;
var handlers = {};
ws.addEventListener('open', function () {
    console.log('connected');
});
ws.addEventListener('message', function (e) {
    console.log(e.data);
    var data = JSON.parse(e.data);
    Object.keys(handlers).forEach(function (key) {
        if (handlers[key][0] === data.topic) {
            handlers[key][1](data);
        }
    });
});
exports.Off = function (id) {
    delete handlers[id];
};
exports.On = function (wildcard, msgHandler) {
    handlerId++;
    handlers[handlerId] = [wildcard, msgHandler];
    return handlerId;
};
exports.Send = function (msg) {
    ws.send(JSON.stringify(msg));
};
//# sourceMappingURL=socket.js.map