import type { Programs } from "./data";

export type ProgramUnion = keyof typeof Programs;
export type LockReleaseType = "EXECUTE" | "STAY";
export type LockOptionBehavior = "EXECUTE" | "HOLD";
export type LockEnableMods = "SHIFT" | "CNTRL" | "ALT";

type ValidProgramNames = (typeof Programs[keyof typeof Programs])["name"];

type StrictMacroMap<T> = {
    [K in keyof T]: K extends `${infer P}\\${string}`
        ? P extends ValidProgramNames 
            ? Macro 
            : `ERROR: '${P}' is not in [${ValidProgramNames}]`
        : Macro;
};

export const createMacroMap = <T extends StrictMacroMap<T>>(map: T): T => {
    return map;
};

export type LockBehavior = {
    release: LockReleaseType,
    options?: {
        "0"?: LockOption,
        "2"?: LockOption,
        "5"?: LockOption,
        "6"?: LockOption,
        "7"?: LockOption
    },
    enable?: LockEnableMods[]
}

export type LockOption = {
    name: string,
    idOverride?: string,
    behavior: LockOptionBehavior
}

export type Macro = {
    combo: string,
    name: string,
    valid: ValidProgramNames[] | ValidProgramNames | RegExp,
    canExecute?: boolean,
    lock?: LockBehavior
}

export type MacroInput = {
    [key: string]: Macro
}

export type DataConfig = {
    PORT: string,
    serverName: string,
}

export type Program = {
    name: string,
    events?: {
        onInit?: boolean,
        onChangeTitle?: boolean,
        onChangeClassNN?: boolean
    }

}

export type ProgramList = {[key: string]: Program};

export type DataInput = {
    dataVersion: number,
    config: DataConfig,
    programs: ProgramList,
    macros: MacroInput
}
