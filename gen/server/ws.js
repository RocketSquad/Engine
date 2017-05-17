"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var userIds = 0;
var Users = new Map();
exports.Start = function (server) {
    var wss = new WebSocket.Server({ server: server });
    wss.on('connection', function (ws) {
        var id = userIds++;
        ws.on('message', function (message) {
            console.log('received: %s', message);
        });
        ws.on('close', function () {
            Users.delete(id);
        });
        var Send = function (msg) {
            ws.send(JSON.stringify(msg));
        };
        Send({
            topic: 'hello',
            payload: []
        });
        Users.set(id, Send);
    });
};
exports.Broadcast = function (msg) {
    Users.forEach(function (fn) { return fn(msg); });
};
//# sourceMappingURL=ws.js.map