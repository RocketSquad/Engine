import {Broadcast} from './ws';
import * as fs from 'fs';

const gaze = require('gaze');
const path = require('path');

const FixPath = (filePath) => {
    return path.relative('public', filePath).replace(/\\/g, '/');
};

gaze('public/**/*.toml', (err, watcher) => {
    watcher.on('changed', (filePath) => {
        fs.readFile(filePath, "utf8", (readErr, data) => {
            Broadcast({
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
            Broadcast({
                topic: 'asset',
                payload: {
                    path: FixPath(filePath),
                    data: data.toString('base64')
                }
            });
        });
    });
});
