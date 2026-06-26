import p5 from 'p5'
import './style.css'
import { Tree } from './Tree';
import type { DataInput } from '../../macroserver/data/dataTypes';
import { Logger } from './Logger';

export const centralServer = `ws://${window.location.host}/client`;

const supportDataVersion = 3;

let selectedClient = "";

let ws : WebSocket;

const sampleSize = 8;

let data : DataInput | undefined;

let currentProgram : string = "~WAITING";
let registry : {[key: number]: string} = {};
let rootTree : Tree;
let currentPath = "";

export let swipe : [number, number][] = [];

let maxTouches = 0;

let locked = false;

export const logger = new Logger(10);

const sketch = (p: p5) => {
  p.setup = () => {

    ws = new WebSocket(`ws://${selectedClient}`);

    ws.onopen = () => {
      console.log('Connected to Websocket');

      ws.onmessage = (ev) => {
        let msg = JSON.parse(ev.data);
        if (msg.type == 'earlyReset') {
          logger.add('Exited early');
          reset();
        } else if (msg.type == 'stateUpdate') {
          console.log(msg);
          currentProgram = msg.data.name;
          registry = msg.data.registry;
          console.log(registry);
          if (data) {
            console.log('Program changed to ' + currentProgram);
            buildTree(data);
          }
        } else {
          console.log('Unknown message: ' + msg);
        }
      }
    }

    ws.onclose = () => {
      console.log('Websocket disconnected');
    }

    (async () => {
      let dataRaw = await fetch('http://' + selectedClient);
      data = await dataRaw.json() as DataInput;
      buildTree(data);
    })();

    let ref = Math.min(p.windowWidth, p.windowHeight);
    p.createCanvas(ref*0.9,ref*0.9);
  }

  p.draw = () => {

    if (ws.readyState == ws.CONNECTING) {
      p.push();
      p.background(255,0,0);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Connecting...", p.width/2, p.height/2);
      p.textSize(p.height/8);
      p.pop();
      return;
    } else if (ws.readyState == ws.CLOSED) {
      p.noLoop();

      p.push();
      p.background(255,0,0);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(p.height/8);
      p.fill(0);
      p.text("Disconnected", p.width/2, p.height/2);
      p.pop();
      return;
    }

    p.background((locked) ? ([255,0,0]) : [255,255,255]);


    if (locked && p.touches.length < maxTouches) {
      maxTouches = p.touches.length;

      if (maxTouches <= 1) {
        resetSwipe();
      }
    }

    if ((p.mouseIsPressed || p.touches.length > 0) && maxTouches <= 1) {
      let currentTree = getCurrentTree();

      if (currentTree?.currentOption == undefined) {
        let pos : [number, number] = [p.mouseX, p.mouseY];
        if (p.touches.length > 0) {
          //@ts-ignore
          pos = [p.touches[0].x, p.touches[0].y];
        }
  
        swipe.push(pos);
      }
    }

    if (locked) {

    } else {

      let newPath = getNewPath();

      let validPath : string[] = [];

      for (let i=0;i<newPath.length;i++) {
        let newTerm = newPath[i];
        let checkTree = rootTree.get(validPath.join("")+newTerm);

        if (checkTree) {
          validPath.push(newTerm);
        }
      }

      currentPath = validPath.join("");
    }

    if (rootTree) {
      let currentTree = getCurrentTree();
      currentTree?.draw(0, locked);

      if (currentTree?.endpoint) {
        maxTouches = Math.max(maxTouches, p.touches.length);
      }

      if (!locked && maxTouches >= 2 && currentTree?.endpoint?.lock) {
        locked = true;

        execute(currentTree.getExecuteName({suffix: 'h'}));

        swipe = [];
      }
    }

    p.push();

    p.stroke(0,255,0);
    p.strokeWeight(4);
    p.noFill();
    p.beginShape();

    swipe.forEach(sp => {
      p.vertex(sp[0], sp[1]);
    });

    p.endShape();

    p.pop();

    if (!locked && currentPath == "" && !currentProgram.startsWith("~")) {
      p.push();
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(p.height/20);
      p.rectMode(p.CENTER);
      p.textWrap("WORD");
      p.text(currentProgram, p.width/2,p.height/2, p.width/3, p.height/3);
      p.pop();
    }
  }

  p.mousePressed = () => {
    if (locked) {
      let currentTree = getCurrentTree();
      executeAndReset(currentTree?.getExecuteName({suffix: 'r'}));
    }
  }
  
  p.mouseReleased = () => {
    if (rootTree) {

      let currentTree = getCurrentTree();

      if (currentTree?.endpoint) {
        if (locked) {
          let currentOption = currentTree?.getCurrentOption();
  
          if (currentTree && p.touches.length == 0) {
            if (currentTree.currentOption) {
              if (currentOption?.behavior == "EXECUTE") {
                executeAndReset(currentTree.getExecuteName({withOption: true, suffix: 'h'}));
              } else {
                execute(currentTree.getExecuteName({withOption: true, suffix: 'r'}));
                currentTree.currentOption = undefined;
              }
            } else {
              executeAndReset(currentTree.getExecuteName({'suffix': 'r'}));
            }
          }
        } else if (maxTouches <= 1) {
          let canExecute = currentTree?.endpoint?.canExecute ?? true;
          if (currentPath.length > 0 && canExecute) {
            execute(currentTree.getExecuteName());
          }
          reset();
        }
      } else {
        reset();
      }
    }
    return false;
  }

  p.keyPressed = (e) => {
    if (e?.key == " ") {
      maxTouches = 2;
    }
  }
}

export const getNewPath = () : string => {

  //const swipe = [[0,0], [-2,2], [-5, 5], [7, 7], [3, 7], [0, 7]];

  if (swipe.length - 1 < sampleSize) {
    return "";
  }

  const indexMap = [4, 7, 6, 5, 3, 0, 1, 2];

  let rawIndexes = [];
  for (let i = 0; i < swipe.length - 1; i++) {
    let p1 = swipe[i];
    let p2 = swipe[i + 1];
    
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];

    if (dx === 0 && dy === 0) continue; 

    let angle = Math.atan2(dy, dx);

    if (angle < 0) {
      angle += 2 * Math.PI;
    }
    
    angle += Math.PI / 8;

    let originalIndex = Math.floor(angle / (Math.PI / 4)) % 8;
    let realIndex = indexMap[originalIndex];

    rawIndexes.push(realIndex);
  }

  let samples = [];
  for (let i = 0; i <= rawIndexes.length - sampleSize; i++) {
    let inSample = new Array(8).fill(0);

    for (let j = 0; j < sampleSize; j++) {
      let ind = rawIndexes[i + j];
      inSample[ind]++;
    }

    let recordIndex = -1;
    let record = -1;
    for (let k = 0; k < 8; k++) {
      if (inSample[k] > record) {
        record = inSample[k];
        recordIndex = k;
      }
    }
    samples.push(recordIndex);
  }

  let newPath = [samples[0]];
  for (let i = 1; i < samples.length; i++) {
    if (newPath[newPath.length - 1] !== samples[i]) {
      newPath.push(samples[i]);
    }
  }
  
  return newPath.join("");
}

export const resetSwipe = () => {
  swipe = [];
}

export const getPosFromIndex = (index: number) => {
  let actualIndex = (index >= 4) ? index + 1 : index;

  let xGrid = actualIndex % 3;
  let yGrid = Math.floor(actualIndex / 3);
  return [xGrid, yGrid];
}

export const execute = (ident?: string) => {
  if (ident) {
    logger.add('Executed ' + ident);
    console.log('Executed ' + ident);
    ws.send(ident);
  }
}

export const reset = () => {

  locked = false;

  resetSwipe();
  let currentTree = getCurrentTree();
  if (currentTree) {
    currentTree.currentOption = undefined
  }
  maxTouches = 0;
  currentPath = "";

}

export const executeAndReset = (ident?: string) => {
  if (ident) {
    execute(ident);
    reset();
  }
}

export const getCurrentTree = () : Tree | undefined => {
  let currentTree = rootTree.get(currentPath);
  if (currentTree) {
    return currentTree;
  }
  return undefined;
}

// function disconnectSocket() {
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     // Force a clean closure code (1000 = Normal Closure)
//     ws.close(1000, "Client reloading/navigating away");
//   }
// }

// window.addEventListener('pagehide', disconnectSocket);
// window.addEventListener('visibilitychange', () => {
  //   if (document.visibilityState === 'hidden') {
    //     disconnectSocket();
    //   }
    // });

let buildTree = (data: DataInput) => {
  if (data) {
    let filteredEntries = Object.entries(data.macros).filter(v => {

      let validIn = v[1].valid;
      
      if (validIn instanceof Array) {
        //@ts-expect-error
        return validIn.includes(currentProgram);
      }

      let matcher : RegExp | string = validIn;

      try {
        matcher = new RegExp(validIn);
        return !!currentProgram.match(matcher);
      } catch (e) {
        return currentProgram == validIn;
      }
    });

    let filteredMacros = Object.fromEntries(filteredEntries);
    rootTree = new Tree(filteredMacros);
  }
}

window.ontouchend = () => {
  p.mouseReleased();
}

export let p : p5;
const init = () => {

  let serverListDiv = document.getElementById('server-list')!;

  let centralWs = new WebSocket(centralServer);
  
  centralWs.addEventListener('open', () => {
    console.log('Opened');
  });

  centralWs.onmessage = (msg) => {
    let msgData = msg.data;

    serverListDiv.innerHTML = '';
    let knownServers = JSON.parse(msgData);
    
    let serverSearchParam = new URLSearchParams(document.location.search).get('server');

    if (serverSearchParam) {
      for (let s in knownServers) {
        let server = knownServers[s];
        if (server.name == serverSearchParam) {
          if (server.dataVersion == supportDataVersion) {
            selectedClient = server.loc;
            centralWs.close();
            serverListDiv.hidden = true;
            p = new p5(sketch, document.getElementById('p5-container')!);
          } else {
            let wrongVersionText = document.createElement('p');
            wrongVersionText.textContent = 'Wrong data version!';
            serverListDiv.appendChild(wrongVersionText);
          }
          return;
        }
      }
      let noConnectText = document.createElement('p');
      noConnectText.textContent = 'Could not connect to server!';
      serverListDiv.appendChild(noConnectText);
      return;
    }

    if (Object.keys(knownServers).length == 0) {
      let errorMsg = document.createElement('p');

      errorMsg.innerHTML = "No Servers Available";
      errorMsg.id = 'serverListErr';

      serverListDiv.appendChild(errorMsg);

      return;
    }

    for (let s in knownServers) {

      let server = knownServers[s];

      let box = document.createElement('div');
      box.id = s;
      box.classList.add('server-item');

      let invalidServer = false;
      if (server.dataVersion != supportDataVersion) {
        invalidServer = true;
        box.classList.add('server-invalid');
      }

      let nameText = document.createElement('p');
      nameText.classList.add('serverName');
      nameText.textContent = server.name;

      box.appendChild(nameText);

      let locText = document.createElement('p');
      locText.classList.add('serverLoc');
      locText.textContent = server.loc

      
      if (!invalidServer) {
        box.addEventListener('click', () => {
          selectedClient = server.loc;
          centralWs.close();
          serverListDiv.hidden = true;
          p = new p5(sketch, document.getElementById('p5-container')!);
        });
      } else {
        locText.textContent += `  !! Incompatible Data Version (C${supportDataVersion} != S${server.dataVersion})`;
      }

      box.appendChild(locText);

      serverListDiv.appendChild(box);
    }
  }

  centralWs.addEventListener('close', () => {
    serverListDiv.innerHTML = '';
    let errorMsg = document.createElement('p');

    errorMsg.innerHTML = "Lost connection";
    errorMsg.id = 'serverListErr';

    serverListDiv.appendChild(errorMsg);
  });
}

init();