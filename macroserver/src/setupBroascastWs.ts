import { centralServer, devMode, serverPort } from ".";
import os from 'os';
import { data } from "../data";
import { v4 } from "uuid";

let serverId : string;
const centralTimeout = 10;

export const setupBroadcastWs = () => {
    let broadcastWs = new WebSocket(centralServer);

    setTimeout(() => {
      if (broadcastWs.readyState != broadcastWs.OPEN) {
        console.log(`Could not connect to central server after ${centralTimeout} seconds, exiting`);
        process.exit();
      }
    }, centralTimeout * 1000);
    broadcastWs.onopen = () => {

        let sName = data.config.serverName + ((devMode) ? "_" + v4().slice(0,5) : '');
        let bcObj = {
          type: "register",
          data: {
            loc: getLocalIpAddress() + ":" + serverPort,
            name: sName,
            dataVersion: data.dataVersion 
          }
        }
        console.log('Attempting to register with central server: \n' + JSON.stringify(bcObj, null, 2));
        broadcastWs.send(JSON.stringify(bcObj));
    }

    broadcastWs.onmessage = (msg) => {
      let parseMsg = JSON.parse(msg.data);
      if (parseMsg.type == 'success') {
        serverId = parseMsg.data;
        console.log("Success!! Server id is " + serverId);
      } else if (parseMsg.type == 'fatalerror') {
        console.log('Fatal Error: ' + parseMsg.data);
        broadcastWs.close();
        process.exit();
      } else {
        console.log('Invalid message ' + msg.data);
      }
    }

    broadcastWs.onclose = () => {
      console.log('Connection to central server lost, exiting');
      broadcastWs.send(JSON.stringify({
        type: "disconnect",
        data: {
          id: serverId
        }
      }));
      process.exit();
    }
}

const getLocalIpAddress = () : string => {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    if (!networkInterface) continue;

    for (const config of networkInterface) {
      // 1. We only want IPv4 addresses (skip IPv6)
      // 2. Skip internal loopback addresses like 127.0.0.1
      if (config.family === 'IPv4' && !config.internal) {
        
        // Optional safety: Ignore virtual network cards like VirtualBox or VMware
        if (interfaceName.toLowerCase().includes('virtual') || interfaceName.toLowerCase().includes('vbox')) {
          continue;
        }

        return config.address; // Returns something like "192.168.1.50"
      }
    }
  }
  
  return 'localhost'; // Fallback if no network is found
}