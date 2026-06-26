import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ahkPath, disableRunner } from ".";
import { data } from "../data";

export let runHot : ChildProcessWithoutNullStreams;
export const setupRunHot = () => {
    runHot = spawn(ahkPath, [`./hotkeys/${disableRunner ? 'dummy/' : ''}runHotkeys.ahk`]);
    
    runHot.on('spawn', () => {
        console.log('Launched runHothey.ahk' + ((disableRunner) ? ' (DUMMY VERSION)' : ''));
    });
    
    runHot.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    runHot.on('error', (err) => {
        console.error('Failed to start the child process:', err.message);
    });
}