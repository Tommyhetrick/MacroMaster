import { createMacroMap, type ProgramList, type DataConfig } from "./dataTypes";

export const dataVersion = 5;

export const config : DataConfig = {
    PORT: "5137",
    serverName: 'dev-pc'
}

export const Programs = {
    "adobe premiere pro": { 
        name: 'premiere'
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
        valid: {
            prog: ["code"]
        }
    },
    "opera\\LeftTab": {
        combo: '3',
        name: 'Left Tab',
        valid: {
            prog: ["opera"]
        }
    },
    "opera\\RightTab": {
        combo: '4',
        name: 'Right Tab',
        valid: {
            prog: ["opera"]
        }
    },
    "opera\\OpenDevTools": {
        combo: '1',
        name: 'Open Dev Tools',
        valid: {
            prog: ["opera"]
        }
    },
    "premiere\\Test1": {
        combo: '0',
        name: 'Apply Transition and stuff',
        valid: {
            prog: "premiere",
            conditions: [`return %r0% == "timeline"`]
        }
    },
    "premiere\\ScaleClip": {
        combo: '13',
        name: 'Scale Clip',
        valid: {
            prog: ["premiere"]
        },
        lock: {
            release: "STAY"
        }
    },
    "premiere\\RotateClip": {
        combo: '14',
        name: 'Rotate Clip',
        valid: {
            prog: ["premiere"]
        },
        canExecute: true,
        lock: {
            release: "STAY"
        }
    },
    "premiere\\RippleDeleteAtPlayhead": {
        combo: '6',
        name: 'Ripple Delete At Playhead',
        valid: {
            prog: ["premiere"]
        },
        canExecute: true
    },
    "premiere\\RippleDeleteBeforePlayhead": {
        combo: '5',
        name: 'Ripple Delete Before Playhead',
        valid: {
            prog: ["premiere"]
        },
        canExecute: true
    },
    "premiere\\ApplyMaskOpacity": {
        combo: '56',
        name: 'Apply Mask / Opacity',
        valid: {
            prog: ["premiere"]
        },
        canExecute: true
    },
    "premiere\\OpenProjectFolder": {
        combo: '4',
        name: 'Open Project Folder',
        valid: {
            prog: ["premiere"]
        },
        canExecute: true
    },
    "winscp\\OpenPuTTY": {
        combo: '1',
        name: 'Open PuTTY Session',
        valid: {
            prog: ["premiere"]
        },
        canExecute: true
    },
    "all": {
        combo: "7",
        name: "All",
        valid: {
            prog: /.+/g,
        },
        canExecute: true
    }
} as const);