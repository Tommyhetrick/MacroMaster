import { stateClean } from ".";
import { runHot } from "./setupRunHot";


export const sendRunCommand = (cmd: string) => {
    if (runHot.stdin && runHot.stdin.writable) {
        if (!stateClean.cleaning) {
            console.log('Sending command: ' + cmd);
            runHot.stdin.write(cmd + "\n");
            stateClean.timer = (cmd.endsWith("_h") ? stateClean.holdMult : 1) * stateClean.timerDef;
        } else {
            console.log('Tried to send command ' + cmd + 'but we are currently cleaning state');
            setTimeout(() => {
                sendRunCommand(cmd);
            }, 50);
        }
    } else {
        console.error('runHot stdin is not writable');
    }
}