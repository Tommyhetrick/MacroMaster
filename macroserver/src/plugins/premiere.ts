import { ahkPath } from "..";
import { EventPlugin, IEventPlugin, RegistryList } from "../PluginManager";
import { spawn } from "child_process";

export const autoInit = false;

export default class PremiereEventPlugin extends EventPlugin implements IEventPlugin {

    panelMappings: Map<string, string> = new Map();

    constructor(name: string) {
        super(name)
    }
    
    async onInit(name: string) : Promise<void>  {
        return new Promise((res, rej) => {
            console.log('Premiere Plugin Init');
    
            let onInitScript = spawn(ahkPath, [`./hotkeys/macros/${name}/_onInit.ahk`]);
                
            onInitScript.on('spawn', () => {
                console.log('Launched premiere onInit ahk script');
            });
    
            onInitScript.stdout.on('data', (data) => {
                let results = JSON.parse(data.toString());
                this.panelMappings = new Map(Object.entries(results));
                console.log(this.panelMappings);
                res();
            })
                
            onInitScript.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
                
            onInitScript.on('error', (err) => {
                console.error('Failed to start the child process:', err.message);
            });
        });
    }
    
    async onChangeUConId(uConId: string) : Promise<RegistryList> {
        let regValue = "";

        let panelMapping = this.panelMappings.get(uConId);

        if (panelMapping) {
            regValue = panelMapping;
        }

        return {
            0: regValue
        }
    }
    
}