## Macro Master

Macro Master provides a gesture based web interface for running macros on a target computer. The interface recieves updates on what program is open, or optionally can be sent more detailed conditional information.

This project is meant to be modular, and designed so that the Macro Server (what is run on the host computer) can easily be deployed.


### Central
The main hub for communications. The central server is told what macro servers are avaliable, hosts the client, and communicates with the client the list of servers.

### Client

The vite built swipe gesture interface. Communicates with a macro server to deliver run commands and recieves updates about the program state. It is deployed on the central server.

### Macro Server

Runs on each host computer, and communicates with the client. When it recieves run commands, it will run a hotkey within its folder. It will presistantly run AutoHotkey scripts to watch for state updates.

Plugins are used to listen for program specific events and update the registry, a list of key value pairs that can be used conditionally to show or hide macros on the client. 

The data folder contains the list of macros in data.ts, and types for the data. This folder is kept in this repository for reference on the structure, but it should be replaced for your use case. 