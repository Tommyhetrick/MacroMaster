import { WebSocketServer } from "ws";
import { httpServer } from ".";
import { v4 } from "uuid";
import { sendRunCommand } from "./utils";
import { currentProgramName } from "./setupUpdateProg";
import { PluginManager } from "./PluginManager";

export let wss : WebSocketServer;

export const setupClientWss = () => {
    wss = new WebSocketServer({server: httpServer});

    wss.on('connection', (socket) => {
        let id = v4();
    
        console.log(id + ' connected');
    
        socket.send(JSON.stringify({
            type: 'stateUpdate',
            data: {
                name: currentProgramName,
                registry: PluginManager.get().registry
            }
        }));
    
        socket.on('close', () => {
            console.log(id + ' disconnected');
        });
    
        socket.on('message', (m) => {
            let msg = m.toString();
            sendRunCommand(msg);
        });
    });
}