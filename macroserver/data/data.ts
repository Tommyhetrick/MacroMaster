import { createMacroMap, type ProgramList, type DataConfig } from "./dataTypes";

export const dataVersion = 3;

export const config : DataConfig= {
    PORT: "5137",
    serverName: 'dev-pc'
}

export const Programs = {
    "adobe premiere pro": { 
        name: 'premiere',
        events: {
            onInit: true,
            onChangeClassNN: true
        }
    },
    "opera": { 
        name: 'opera' 
    },
    "code": { 
        name: 'code' 
    },
    "winscp": { 
        name: 'winscp' 
    }
} as const satisfies ProgramList;

export const macros = createMacroMap({
    "code\\RestartTS": {
        combo: '1',
        name: "Restart TS Server",
        valid: ["code"]
    },
    "opera\\LeftTab": {
        combo: '3',
        name: 'Left Tab',
        valid: ["opera"]
    },
    "opera\\RightTab": {
        combo: '4',
        name: 'Right Tab',
        valid: ["opera"]
    },
    "opera\\OpenDevTools": {
        combo: '1',
        name: 'Open Dev Tools',
        valid: ["opera"]
    },
    "premiere\\Test1": {
        combo: '45454',
        name: 'Apply Transition and stuff',
        valid: ["opera"]
    },
    "premiere\\ScaleClip": {
        combo: '13',
        name: 'Scale Clip',
        valid: ["premiere"],
        lock: {
            release: "STAY"
        }
    },
    "premiere\\RotateClip": {
        combo: '14',
        name: 'Rotate Clip',
        valid: ["premiere"],
        canExecute: true,
        lock: {
            release: "STAY"
        }
    },
    "premiere\\RippleDeleteAtPlayhead": {
        combo: '6',
        name: 'Ripple Delete At Playhead',
        valid: ["premiere"],
        canExecute: true
    },
    "premiere\\RippleDeleteBeforePlayhead": {
        combo: '5',
        name: 'Ripple Delete Before Playhead',
        valid: ["premiere"],
        canExecute: true
    },
    "premiere\\ApplyMaskOpacity": {
        combo: '56',
        name: 'Apply Mask / Opacity',
        valid: ["premiere"],
        canExecute: true
    },
    "premiere\\OpenProjectFolder": {
        combo: '4',
        name: 'Open Project Folder',
        valid: ["premiere"],
        canExecute: true
    },
    "winscp\\OpenPuTTY": {
        combo: '1',
        name: 'Open PuTTY Session',
        valid: ["winscp"],
        canExecute: true
    },
    "all": {
        combo: "7",
        name: "All",
        valid: /.+/g,
        canExecute: true
    }
} as const);