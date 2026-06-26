export class Logger {
    logs: string[] = [];
    maxLogs : number;

    constructor(maxLogs: number) {
        this.maxLogs = maxLogs;
    }

    add(msg: string) {
        let date = new Date();
        let datePref = `${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}:${date.getSeconds().toString().padStart(2,"0")} `;
        let sendMsg = datePref + msg;

        this.logs.push(sendMsg);

        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(1);
        }

        this.render();
    }

    render() {
        let logDiv = document.getElementById('log-div')!;
        logDiv.innerHTML = '';

        for (let m of this.logs) {
            let pTag = document.createElement('p');
            pTag.classList.add('log-item');
            pTag.textContent = m;

            logDiv.appendChild(pTag);
        }
    }
}