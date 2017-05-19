"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("./ws");
const fs = require("fs");
const gaze = require('gaze');
const path = require('path');
const FixPath = (filePath) => {
    return path.relative('public', filePath).replace(/\\/g, '/');
};
gaze('public/**/*.toml', (err, watcher) => {
    watcher.on('changed', (filePath) => {
        fs.readFile(filePath, "utf8", (readErr, data) => {
            ws_1.Broadcast({
                topic: 'asset',
                payload: {
                    path: FixPath(filePath),
                    data
                }
            });
        });
    });
});
gaze('public/**/*.vox', (err, watcher) => {
    watcher.on('changed', (filePath) => {
        fs.readFile(filePath, (readErr, data) => {
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
