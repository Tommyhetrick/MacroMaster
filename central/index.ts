import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { v4 } from 'uuid';

export type ServerInfo = {
    loc: string, 
    name: string,
    dataVersion: number
}

const PORT = 5200;

const app = express();
const server = createServer(app);

const distPath = path.join(process.cwd(), './webapp/');

app.use(express.static(distPath));

const clientWss = new WebSocketServer({ noServer: true });
const macroWss = new WebSocketServer({ noServer: true });

let knownServers: {[key: string]: ServerInfo} = {

}

clientWss.on('connection', (socket) => {
    socket.send(JSON.stringify(knownServers));
});

macroWss.on('connection', (socket) => {
    console.log('New connection');

    let serverId : string;

    socket.on('message', (msg) => {
        let msgData : {type: string, data: any} = JSON.parse(msg.toString());

        serverId = v4();

        if (msgData.type == "register") {
            let newServer : ServerInfo = msgData.data;
            
            for (let ksk in knownServers) {
                let ks = knownServers[ksk];
                if (newServer.name == ks.name) {
                    console.log(newServer.loc + ' attempted to register, but name ' + newServer.name + ' was in use!');
                    socket.send(JSON.stringify({
                        type: 'fatalerror',
                        data: 'Server name already taken!'
                    }));
                    return;
                }
            }

            console.log('Added new server ' + serverId + ' @ ' + newServer.loc + ` (${newServer.name})`);
            knownServers[serverId] = newServer;
    
            socket.send(JSON.stringify({
                type: 'success',
                data: serverId
            }));

            broadcastUpdate();
        } else {
            console.log('Invalid message: ' + msgData);
        }
    });

    let failedBeats = 0;

    let heartbeat = setInterval(() => {
        socket.ping('heartbeat', false, (err) => {
            if (err) {
                failedBeats++;

                if (failedBeats >= 5) {
                    console.log(serverId + ' has lost connection, removing');
                    delete knownServers[serverId];
                    socket.close();
                    clearInterval(heartbeat);
                    broadcastUpdate();
                }
                return;
            }
            failedBeats = 0;
        })
    }, 1000);
    
});

server.on('upgrade', (request, socket, head) => {
    if (!request.url) {
        socket.destroy();
        return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);

    const cleanPath = url.pathname.replace(/\/+$/, '').toLowerCase();

    if (cleanPath === '/client') {
        clientWss.handleUpgrade(request, socket, head, (ws) => clientWss.emit('connection', ws));
    } else if (cleanPath === '/macro') {
        macroWss.handleUpgrade(request, socket, head, (ws) => macroWss.emit('connection', ws));
    } else {
        socket.destroy();
    }
});

const broadcastUpdate = () => {
    clientWss.clients.forEach(c => {
        c.send(JSON.stringify(knownServers));
    });
}

server.listen(PORT, () => console.log(`Central Hub Server running on port ${PORT}!`));