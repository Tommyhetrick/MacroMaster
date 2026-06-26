import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ahkPath, serverPort } from ".";
import { wss } from "./setupClientWss";
import { PluginManager } from "./PluginManager";

export let updateProg : ChildProcessWithoutNullStreams;

export let currentProgramName = "~WAITING";

export const setupUpdateProg = () => {

    let updateProg = spawn(ahkPath, [`./hotkeys/updateProg.ahk`, serverPort]);

    updateProg.on('spawn', () => {
        console.log('Launched updateProg.ahk');
    });

    updateProg.stdout.on('data', async (data) => {
        let msg = JSON.parse(data.toString());

        if (msg.type == 'earlyReset') {
            console.log('Early Reset Triggered!');
            wss.clients.forEach(c => {
                c.send(msg);
            });
        } else if (msg.type == 'stateUpdate') {
            let pluginManager = PluginManager.get();
            await pluginManager.handleStateUpdate(msg.data);
            //sendProgUpdate(msg);

            currentProgramName = msg.data.name.data;

            wss.clients.forEach(c => {
                c.send(JSON.stringify({
                    type: 'stateUpdate',
                    data: {
                        name: currentProgramName,
                        registry: pluginManager.registry
                    }
                }));
            })
        }
    });

    updateProg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    updateProg.on('error', (err) => {
        console.error('Failed to start the child process:', err.message);
    });
}