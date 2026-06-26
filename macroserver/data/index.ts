import { config, dataVersion, macros, Programs } from "./data";
import type { DataInput } from "./dataTypes";

export const data = {
    dataVersion: dataVersion,
    config: config,
    programs: Programs,
    macros
} as DataInput;