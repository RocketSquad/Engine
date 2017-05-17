import {Broadcast} from './ws';
import * as fs from 'fs';

const gaze = require('gaze');

gaze('public/**/*.toml', (err, watcher) => {
    watcher.on('changed', (path) => {
        fs.readFile(path, "utf8", (readErr, data) => {
            Broadcast({
                topic: 'asset',
                payload: {
                    path,
                    data
                }
            });
        });
    });
});

gaze('public/**/*.vox', (err, watcher) => {
    watcher.on('changed', (path) => {
        fs.readFile(path, (readErr, data) => {
            Broadcast({
                topic: 'asset',
                payload: {
                    path,
                    data: data.toString('base64')
                }
            });
        });
    });
});
