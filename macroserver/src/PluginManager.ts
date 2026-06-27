import { data } from "../data";
import { currentProgramName } from "./setupUpdateProg";

export type StateUpdateData = {
    name: {
        data: string,
        changed: number
    },
    uConId: {
        data: string,
        changed: number
    },
}

export type RegistryList = {[key: number]: string};

export class EventPlugin implements IEventPlugin {
    name: string = "";
    hasInit: boolean = false;

    constructor(name: string) {
        this.name = this.name;
    }

    async onInit(name: string) {
        
    };

    async onChangeUConId(uConId: string) : Promise<RegistryList | undefined> {
        return undefined;
    };
}

export interface IEventPlugin {
    onInit: (name: string) => void,
    onChangeUConId: (uConId: string) => Promise<RegistryList | undefined>;
}

export class PluginManager {

    static singleton : PluginManager;
    
    static get() {
        if (!this.singleton) {
            this.singleton = new PluginManager();
        }

        return this.singleton;
    }

    
    store: Map<string, EventPlugin> = new Map();
    registry : RegistryList = {};

    constructor() {
        for (let i=0;i<10;i++) {
            this.registry[i] = "";
        }
    }

    async getPlugin(name: string, alwaysCreate: boolean = false) : Promise<EventPlugin | undefined> {
        let existingPlugin = this.store.get(name);
        if (existingPlugin) {
            return existingPlugin;
        } else {
            try {
                let myMod = await import(`./plugins/${name}.ts`);

                let pluginInstance : EventPlugin = new myMod.default(name);

                let autoInit = true;

                if (myMod.autoInit != undefined) {
                    autoInit = myMod.autoInit;
                }

                if (autoInit || alwaysCreate) {
                    this.store.set(name, pluginInstance);
    
                    await pluginInstance.onInit(name);
                    pluginInstance.hasInit = true;
                    return pluginInstance;
                }
                return undefined;
            } catch (e) {}
            return undefined;
        }
    }

    async handleStateUpdate(update: StateUpdateData) {
        let plugin = await this.getPlugin(update.name.data);

        if (!plugin?.hasInit) {
            return;
        }

        if (update.uConId.changed) {
            console.log('uConId Changed: ' + update.uConId.data);
            let result = await plugin?.onChangeUConId(update.uConId.data);

            if (result) {
                for (let k in result) {
                    this.registry[k] = result[k];
                }
            }
        }
    }
}