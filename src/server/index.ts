import * as express from 'express';
import * as ws from './ws';
import './assets';

const http = require('http');
const app = express();

app.use(express.static('public'));
const server = http.createServer(app);

ws.Start(server);
server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});
