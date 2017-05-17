"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("./ws");
var fs = require("fs");
var gaze = require('gaze');
gaze('public/**/*.toml', function (err, watcher) {
    watcher.on('changed', function (path) {
        fs.readFile(path, "utf8", function (readErr, data) {
            ws_1.Broadcast({
                topic: 'asset',
                payload: {
                    path: path,
                    data: data
                }
            });
        });
    });
});
gaze('public/**/*.vox', function (err, watcher) {
    watcher.on('changed', function (path) {
        fs.readFile(path, function (readErr, data) {
            ws_1.Broadcast({
                topic: 'asset',
                payload: {
                    path: path,
                    data: data.toString('base64')
                }
            });
        });
    });
});
//# sourceMappingURL=assets.js.map