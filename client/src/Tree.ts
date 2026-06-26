import type {LockOption, Macro, MacroInput } from "../../macroserver/data/dataTypes";
import { execute, executeAndReset, getNewPath, getPosFromIndex, p, resetSwipe } from "./main";

export class Tree {

    path: string;
    endpoint: Macro | undefined;
    endpointKey: string | undefined;
    children : (Tree | undefined)[] = new Array(8);
    currentOption : string | undefined;

    constructor(macros: MacroInput, path: string = "") {

        this.path = path;

        for (let m in macros) {
            let combo = macros[m].combo;
            if (combo == this.path) {
                this.endpoint = macros[m];
                this.endpointKey = m;
            }
        }

        for (let i=0;i<8;i++) {

            let matchedEntries = Object.entries(macros).filter(([_, val]) => val.combo[this.path.length] == i.toString());
            
            if (matchedEntries.length > 0) {
                let matched = Object.fromEntries(matchedEntries);
                
                this.children[i] = new Tree(matched, this.path + i.toString());
            }
        }
    }

    get(path: string) : Tree | undefined {
        if (path == "") {
            return this;
        }

        let next = parseInt(path[0]);
        let nextChild = this.children[next];

        if (nextChild) {
            return nextChild.get(path.slice(1));
        }

        return undefined;
    }

    draw(depth: number, locked?: boolean) {

        if (depth == 0) {
            p.line(0, p.height/3, p.width, p.height/3);
            p.line(0, 2*p.height/3, p.width, 2*p.height/3);

            p.line(p.width/3, 0, p.width/3, p.height);
            p.line(2*p.width/3, 0, 2*p.width/3, p.height);
        }

        p.fill((depth == 0) ? 0 : ((this.endpoint) ? 127 : 255));
        p.rect(p.width/3,p.height/3,p.width/3,p.height/3);

        if (this.endpoint && depth == 0) {
            p.push();
            p.noStroke();
            p.fill(255);
    
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(p.height/20);
            p.rectMode(p.CENTER);
            p.textWrap("WORD");
            p.text(this.endpoint.name, p.width/2,p.height/2, p.width/3, p.height/3);
            p.pop();
        }

        if (locked) {
            this.drawLocked();
            return;
        }

        for (let i=0;i<8;i++) {
            let child = this.children[i];

            if (child) {
                let [xGrid, yGrid] = getPosFromIndex(i);

                p.push();
                p.scale(1/3);
                p.translate(xGrid * p.width, yGrid * p.height);
                child.draw(depth + 1);
                p.pop();
            }
        }
    }

    drawLocked() {
        let options = this.getOptions();

        let current = getNewPath();

        if (this.currentOption) {
            p.fill(127);
            let [xGrid, yGrid] = getPosFromIndex(parseInt(this.currentOption));
            p.rect(xGrid * p.width/3,yGrid * p.height/3,p.width/3,p.height/3);
        }

        for (let op in options) {

            let index = parseInt(op);
            let [xGrid, yGrid] = getPosFromIndex(index);

            p.fill(0);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(options[op].name, (xGrid+0.5)*(p.width/3), (yGrid+0.5)*(p.height/3));
        
            if (this.currentOption == undefined && current.length > 0) {
                let next = current[0];
                if (next == op) {
                    resetSwipe();
                    this.currentOption = op;

                    if (this.getCurrentOption()?.behavior == "EXECUTE") {
                        executeAndReset(this.getExecuteName({withOption: true, suffix: 'r'}));
                    } else {
                        execute(this.getExecuteName({withOption: true, suffix: 'h'}));
                    }
                }
            }
        }
    }

    getOptions() : {[key: string]: LockOption} {
        let lockBehavior = this.endpoint?.lock;
        let modOptions : {[key: string]: LockOption} = {};

        if (lockBehavior?.enable) {
            lockBehavior?.enable.forEach(e => {
                switch (e) {
                    case "CNTRL":
                        modOptions["3"] = {
                            name: "CNTRL",
                            idOverride: "CNTRL",
                            behavior: "HOLD"
                        }
                        break;

                    case "SHIFT":
                        modOptions["1"] = {
                            name: "SHIFT",
                            idOverride: "SHIFT",
                            behavior: "HOLD"
                        }
                        break;

                    case "ALT":
                        modOptions["4"] = {
                            name: "ALT",
                            idOverride: "ALT",
                            behavior: "HOLD"
                        }
                        break;
                }
            });
        }

        for (let lo in lockBehavior?.options) {
            // @ts-ignore
            modOptions[lo] = lockBehavior.options[lo];
        }

        return modOptions;
    }

    getCurrentOption() : LockOption | undefined  {
        if (this.currentOption) {
            return this.getOptions()[this.currentOption];
        }
        return undefined;
    }

    getExecuteName(options?: {withOption?: boolean, suffix?: string}) {

        if (!this.endpoint) {
            return undefined;
        }

        let optionText = "";

        let mainName = this.endpointKey;

        if (options?.withOption && this.currentOption) {
            let idOverride = this.getCurrentOption()?.idOverride;
            if (idOverride) {
                mainName = idOverride;
            }
            optionText = "_" + this.currentOption;
        }

        let suffixText = (options?.suffix) ? "_" + options.suffix : "";

        return mainName + optionText + suffixText;
    }
}