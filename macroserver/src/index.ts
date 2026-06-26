import express from 'express';
import { createServer } from 'http';
import { writeFile } from 'fs';
import {data} from '../data';
import cors from 'cors';
import { runHot, setupRunHot } from './setupRunHot';
import { setupUpdateProg, updateProg } from './setupUpdateProg';
import { setupBroadcastWs } from './setupBroascastWs';
import { setupClientWss } from './setupClientWss';

export const disableRunner = false;

export const ahkPath = "C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey64.exe";

export const devMode = ('MM_DEV' in process.env);

export const centralAddress = (devMode) ? "localhost" : '10.0.0.118';

export const centralServer = `ws://${centralAddress}:5200/macro`;

export let serverPort = (devMode) ? '5150' : data.config.PORT;

const app = express();

export let stateClean = {
    timerDef: 60,
    timer: -1,
    cleaning: false,
    holdMult: 1.5
}

app.use(cors());

export const httpServer = createServer(app);

app.get('/', (req, res) => {
    res.json(data);
});


const cleanup = () => {
    console.log('Node process exiting. Cleaning up AHK scripts...');
    
    if (runHot) runHot.kill('SIGTERM');
    if (updateProg) updateProg.kill('SIGTERM');
    
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

setupBroadcastWs();
setupClientWss();
setupRunHot();
setupUpdateProg();


httpServer.listen(serverPort, () => {
  console.log(`Macro Server running on port ${serverPort}${(devMode) ? " in dev mode" : ""}`);
});

setInterval(() => {
    if (stateClean.timer < 0) {

        stateClean.timer = stateClean.timerDef;

        stateClean.cleaning = true;
        writeFile('./hotkeys/macros/_state.ini', '', (err) => {

            if (err) {
                console.log('Error cleaning state file ' + err);
            }
            console.log('Cleaned state');
            stateClean.cleaning = false;
        });
    } else {
        stateClean.timer--;
    }
}, 1000);
