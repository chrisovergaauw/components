import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Terminal as Xterm } from 'xterm';
import xtermcss from 'xterm/css/xterm.css'
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import styled, { css } from 'styled-components'
import useResizeObserver from './util/useResizeObserver'

const StyledTerminal = styled.div`
  ${css(xtermcss)};
  
  ${props => props.fullScreen} {
    position: absolute;
    left: 0;
    top: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;      
}
${props => !props.fullScreen} {
    width: 50vw;
    height: 50vh;
    padding: 5px;
    
    @media (max-width: 1024px) {
      width: 100vw;
      height: 100vh;
    }
}


`;

function Terminal() {

    const terminalRef = useRef(null);
    const fitAddon = useMemo(() => new FitAddon(), []);
    const [fullScreen, setFullScreen] = useState(true);

    const websocket = useMemo(() => {
        return new WebSocket(`ws://${window.location.hostname}:8123/`)
    }
    , []);

    const xterm = useMemo(() => new Xterm(
        {
            scrollback: 9999999,
            cursorBlink: true,
        }), []);

    const resizeTerminal = useCallback(() => {
        fitAddon.fit();
        if (websocket.readyState === 1) {
            console.log(`resize ${xterm.cols} ${xterm.rows}`);
            websocket.send(`resize ${xterm.cols} ${xterm.rows}`);
        }
    }, [fitAddon, websocket, xterm.cols, xterm.rows]);

    useEffect(() => {
        const attachAddon = new AttachAddon(websocket);
        xterm.loadAddon(attachAddon);
        xterm.loadAddon(new WebLinksAddon());
        xterm.loadAddon(fitAddon);
        websocket.onopen = () => resizeTerminal();



    }, [websocket, xterm, fitAddon]);

    useResizeObserver({callback: resizeTerminal, element: terminalRef});

    useEffect(() => {
        xterm.attachCustomKeyEventHandler((e) => {
            if (e.ctrlKey && e.shiftKey && e.keyCode === 13) {
                setFullScreen(fs => !fs);
                fitAddon.fit();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && e.keyCode === 82) {
                fitAddon.fit();
                return false;
            }
        })
    }, [xterm, setFullScreen, fitAddon]);

    useEffect(() => {
        xterm.open(document.getElementById('terminal'));
    }, [xterm]);

    return (<StyledTerminal  fullScreen={fullScreen} ref={terminalRef} id="terminal"/>)
}

export default Terminal;