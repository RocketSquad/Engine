import * as express from 'express';
import {Socket} from './engine/ws';
import './engine/asset-server';

const http = require('http');
const app = express();

app.use(express.static('public'));
const server = http.createServer(app);

Socket.start(server);
server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});
