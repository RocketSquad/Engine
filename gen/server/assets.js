"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("./ws");
var fs = require("fs");
var gaze = require('gaze');
var path = require('path');
var FixPath = function (filePath) {
    return path.relative('public', filePath).replace(/\\/g, '/');
};
gaze('public/**/*.toml', function (err, watcher) {
    watcher.on('changed', function (filePath) {
        fs.readFile(filePath, "utf8", function (readErr, data) {
            ws_1.Broadcast({
                topic: 'asset',
                payload: {
                    path: FixPath(filePath),
                    data: data
                }
            });
        });
    });
});
gaze('public/**/*.vox', function (err, watcher) {
    watcher.on('changed', function (filePath) {
        fs.readFile(filePath, function (readErr, data) {
            ws_1.Broadcast({
                topic: 'asset',
                payload: {
                    path: FixPath(filePath),
                    data: data.toString('base64')
                }
            });
        });
    });
});
//# sourceMappingURL=assets.js.map