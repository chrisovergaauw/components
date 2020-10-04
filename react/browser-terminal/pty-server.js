const Pty = require('node-pty');
const WebSocket = require('ws');
const os = require('os');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8123 });

const shell = os.platform() === 'win32' ? 'powershell.exe' :
    fs.existsSync('/bin/zsh') ? '/bin/zsh' : '/bin/bash';

wss.on('connection', function connection(ws, req) {

    // Each ws will have it's own terminal
    ws.tty = Pty.spawn(
        shell,
        [],
        {
            name: 'xterm-color',
            cwd: process.env.PWD,
            env: process.env,
        });

    ws.tty.onExit(() => {
        ws.tty = null;
        ws.close();
    });

    ws.tty.onData((data) => {
        ws.send(data);
    });


    ws.on('message', (msg) => {
        if (msg.startsWith('resize')) {
            let resizeArgs = msg.split(' ');
            let cols = resizeArgs[1];
            let rows = resizeArgs[2];

            if (!cols.isNaN && !rows.isNaN) {
                ws.tty.resize(parseInt(cols), parseInt(rows));
            }

        } else {
            ws.tty && ws.tty.write(msg);
        }
    });

    ws.on('close', (wsBeforeClosing) => {
        if (wsBeforeClosing.tty) {
            wsBeforeClosing.tty.kill(9);
            wsBeforeClosing.tty = null;
        }
    });

});