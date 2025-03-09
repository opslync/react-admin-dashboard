import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import { API_BASE_URL } from '../../library/constant';

export const PodShell = ({ podDetails, appId }) => {
    const terminalRef = useRef(null);
    const containerRef = useRef(null);
    const [terminal, setTerminal] = useState(null);
    const [wsConnection, setWsConnection] = useState(null);

    useEffect(() => {
        // Debug pod details and app ID
        console.log('Pod Details:', podDetails);
        console.log('App ID:', appId);

        // Initialize terminal
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff'
            }
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new WebLinksAddon());

        // Wait for the container to be available in the DOM
        if (containerRef.current) {
            console.log('Terminal container mounted');
            term.open(containerRef.current);
            
            // Fit the terminal to container
            setTimeout(() => {
                try {
                    fitAddon.fit();
                    console.log('Terminal fitted successfully');
                } catch (error) {
                    console.error('Error fitting terminal:', error);
                }
            }, 0);

            // Handle window resize
            const handleResize = () => {
                try {
                    fitAddon.fit();
                } catch (error) {
                    console.error('Error during resize:', error);
                }
            };
            window.addEventListener('resize', handleResize);

            // Connect to WebSocket
            const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws');
            const wsUrl = `${wsBaseUrl}app/${appId}/pods/shell?pod_name=${podDetails.podName}&container=${podDetails.container}`;
            console.log('Attempting WebSocket connection to:', wsUrl);

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket connection established');
                // term.writeln('Connected to pod shell...');
            };

            ws.onmessage = (event) => {
                try {
                    console.log('WebSocket message received:', event.data);
                    term.write(event.data);
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                    term.writeln('\r\nError processing message: ' + error.message);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                console.error('WebSocket Error Details:', {
                    readyState: ws.readyState,
                    bufferedAmount: ws.bufferedAmount,
                    protocol: ws.protocol,
                    url: ws.url
                });
                term.writeln('WebSocket Error: ' + (error.message || 'Connection failed'));
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                term.writeln(`\r\nConnection closed (Code: ${event.code}${event.reason ? ', Reason: ' + event.reason : ''})`);
            };

            // Handle terminal input
            term.onData(data => {
                if (ws.readyState === WebSocket.OPEN) {
                    try {
                        console.log('Sending data to WebSocket:', data);
                        ws.send(data);
                    } catch (error) {
                        console.error('Error sending data to WebSocket:', error);
                        term.writeln('\r\nError sending command: ' + error.message);
                    }
                } else {
                    console.warn('WebSocket not in OPEN state. Current state:', ws.readyState);
                    term.writeln('\r\nWebSocket not connected. Cannot send command.');
                }
            });

            setTerminal(term);
            setWsConnection(ws);

            // Cleanup
            return () => {
                console.log('Cleaning up terminal and WebSocket');
                window.removeEventListener('resize', handleResize);
                term.dispose();
                if (ws) {
                    console.log('Closing WebSocket connection');
                    ws.close();
                }
            };
        } else {
            console.error('Terminal container not found in DOM');
        }
    }, [appId, podDetails]);

    return (
        <div 
            ref={containerRef} 
            className="h-[500px] w-full bg-[#1e1e1e] p-4"
            style={{ minHeight: '500px' }}
        />
    );
};