import React, { useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { API_BASE_URL } from '../../library/constant';

export const PodShell = ({ podDetails, appId }) => {
    const terminalRef = useRef(null);
    const terminalInstanceRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!terminalRef.current || !podDetails || !appId) return;

        // Initialize terminal
        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff',
                cursor: '#ffffff',
                selection: 'rgba(255, 255, 255, 0.3)',
                black: '#000000',
                brightBlack: '#666666',
                red: '#ff0000',
                brightRed: '#ff0000',
                green: '#33ff00',
                brightGreen: '#33ff00',
                yellow: '#ffff00',
                brightYellow: '#ffff00',
                blue: '#0066ff',
                brightBlue: '#0066ff',
                magenta: '#cc00ff',
                brightMagenta: '#cc00ff',
                cyan: '#00ffff',
                brightCyan: '#00ffff',
                white: '#d0d0d0',
                brightWhite: '#ffffff'
            }
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        // Create WebSocket connection
        const wsBase = API_BASE_URL.replace(/^http/, 'ws');
        const ws = new WebSocket(`${wsBase}app/${appId}/pod/shell`);
        wsRef.current = ws;

        ws.onopen = () => {
            terminal.write('\r\n\x1b[1;34mConnecting to pod shell...\x1b[0m\r\n');

            // Send pod details
            ws.send(JSON.stringify({
                namespace: podDetails.namespace,
                pod_name: podDetails.podName,
                container: podDetails.container
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.output) {
                    terminal.write(data.output);
                }
            } catch (error) {
                // If not JSON, write directly
                terminal.write(event.data);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            terminal.write('\r\n\x1b[1;31mError: Failed to connect to pod shell\x1b[0m\r\n');
        };

        ws.onclose = () => {
            terminal.write('\r\n\x1b[1;33mConnection closed\x1b[0m\r\n');
        };

        // Handle terminal input
        terminal.onData(data => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ input: data }));
            }
        });

        // Mount terminal
        terminal.open(terminalRef.current);
        fitAddon.fit();
        terminalInstanceRef.current = terminal;

        // Handle window resize
        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (terminalInstanceRef.current) {
                terminalInstanceRef.current.dispose();
            }
        };
    }, [podDetails, appId]);

    return (
        <Paper
            elevation={3}
            sx={{
                width: '100%',
                height: '500px',
                overflow: 'hidden',
                backgroundColor: '#1e1e1e',
                borderRadius: 1
            }}
        >
            <Box
                ref={terminalRef}
                sx={{
                    width: '100%',
                    height: '100%',
                    padding: 1
                }}
            />
        </Paper>
    );
};