import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as TerminalIcon, Wifi, WifiOff, RefreshCw, Maximize2, Copy, Download } from 'lucide-react';
import 'xterm/css/xterm.css';
import { API_BASE_URL } from '../../library/constant';

export const PodShell = ({ podDetails, appId }) => {
    const terminalRef = useRef(null);
    const containerRef = useRef(null);
    const fitAddonRef = useRef(null); // <-- Add fitAddon ref
    const [terminal, setTerminal] = useState(null);
    const [wsConnection, setWsConnection] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        startTime: new Date(),
        commandCount: 0,
        lastActivity: new Date()
    });

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-400';
            case 'connecting': return 'text-yellow-400';
            case 'disconnected': return 'text-red-400';
            case 'error': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected': return <Wifi className="w-4 h-4" />;
            case 'connecting': return <RefreshCw className="w-4 h-4 animate-spin" />;
            case 'disconnected':
            case 'error': return <WifiOff className="w-4 h-4" />;
            default: return <WifiOff className="w-4 h-4" />;
        }
    };

    const handleReconnect = () => {
        if (wsConnection) {
            wsConnection.close();
        }
        // The useEffect will handle reconnection
        setConnectionStatus('connecting');
    };

    const handleClearTerminal = () => {
        if (terminal) {
            terminal.clear();
        }
    };

    const handleCopySession = () => {
        if (terminal) {
            const selection = terminal.getSelection();
            if (selection) {
                navigator.clipboard.writeText(selection);
            }
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const formatUptime = (startTime) => {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    useEffect(() => {
        console.log('PodShell useEffect triggered', { appId, podDetails });
        // Debug pod details and app ID
        console.log('Pod Details:', podDetails);
        console.log('App ID:', appId);

        // Initialize terminal with better theme
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", monospace',
            lineHeight: 1.2,
            letterSpacing: 0.5,
            theme: {
                background: '#0d1117',
                foreground: '#c9d1d9',
                cursor: '#58a6ff',
                cursorAccent: '#0d1117',
                selection: '#264f78',
                black: '#484f58',
                red: '#ff7b72',
                green: '#7ee787',
                yellow: '#f2cc60',
                blue: '#58a6ff',
                magenta: '#bc8cff',
                cyan: '#39c5cf',
                white: '#b1bac4',
                brightBlack: '#6e7681',
                brightRed: '#ffa198',
                brightGreen: '#56d364',
                brightYellow: '#e3b341',
                brightBlue: '#79c0ff',
                brightMagenta: '#d2a8ff',
                brightCyan: '#56d4dd',
                brightWhite: '#f0f6fc'
            },
            allowTransparency: true,
            scrollback: 10000,
            convertEol: true
        });

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon; // <-- Store in ref
        term.loadAddon(fitAddon);
        term.loadAddon(new WebLinksAddon());

        // Helper to fit terminal only when container is visible and sized
        const fitTerminal = () => {
            if (
                fitAddonRef.current &&
                containerRef.current &&
                containerRef.current.offsetWidth > 0 &&
                containerRef.current.offsetHeight > 0 &&
                term &&
                !term._disposed
            ) {
                try {
                    fitAddonRef.current.fit();
                    console.log('Terminal fitted successfully');
                } catch (error) {
                    console.error('Error fitting terminal:', error);
                }
            } else {
                if (!fitAddonRef.current) console.warn('fitAddonRef.current is missing');
                if (!containerRef.current) console.warn('containerRef.current is missing');
                if (containerRef.current && (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0)) console.warn('containerRef.current has zero size');
                if (!term) console.warn('terminal is missing');
                if (term && term._disposed) console.warn('terminal is disposed');
                // Retry after a short delay if container is not ready
                setTimeout(fitTerminal, 100);
            }
        };

        // Wait for the container to be available in the DOM
        if (containerRef.current) {
            console.log('Terminal container mounted');
            term.open(containerRef.current);
            fitTerminal();

            // Handle window resize
            const handleResize = () => {
                try {
                    fitTerminal();
                } catch (error) {
                    console.error('Error during resize:', error);
                }
            };
            window.addEventListener('resize', handleResize);

            // Connect to WebSocket
            const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws').replace(/\/?$/, '/');
            const token = localStorage.getItem('token');
            const wsUrl = `${wsBaseUrl}api/app/${appId}/pods/shell?pod_name=${podDetails.podName}&container=${podDetails.container}&token=${token}`;
            console.log('Attempting WebSocket connection to:', wsUrl);

            setConnectionStatus('connecting');
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket connection established');
                setConnectionStatus('connected');
                term.writeln('\r\n\x1b[32m✓ Connected to pod shell\x1b[0m');
                term.writeln('\x1b[36mShell session ready. You can start typing commands...\x1b[0m\r\n');
            };

            ws.onmessage = (event) => {
                try {
                    console.log('WebSocket message received:', event.data);
                    term.write(event.data);
                    setSessionInfo(prev => ({
                        ...prev,
                        lastActivity: new Date()
                    }));
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                    term.writeln('\r\n\x1b[31mError processing message: ' + error.message + '\x1b[0m');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                setConnectionStatus('error');
                term.writeln('\r\n\x1b[31m✗ WebSocket connection error\x1b[0m');
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                setConnectionStatus('disconnected');
                term.writeln(`\r\n\x1b[33m⚠ Connection closed (Code: ${event.code}${event.reason ? ', Reason: ' + event.reason : ''})\x1b[0m`);
            };

            // Handle terminal input
            term.onData(data => {
                if (ws.readyState === WebSocket.OPEN) {
                    try {
                        console.log('Sending data to WebSocket:', data);
                        ws.send(data);
                        setSessionInfo(prev => ({
                            ...prev,
                            commandCount: prev.commandCount + (data === '\r' ? 1 : 0),
                            lastActivity: new Date()
                        }));
                    } catch (error) {
                        console.error('Error sending data to WebSocket:', error);
                        term.writeln('\r\n\x1b[31mError sending command: ' + error.message + '\x1b[0m');
                    }
                } else {
                    console.warn('WebSocket not in OPEN state. Current state:', ws.readyState);
                    term.writeln('\r\n\x1b[33mWebSocket not connected. Cannot send command.\x1b[0m');
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
                fitAddonRef.current = null; // Clean up fitAddon ref
            };
        } else {
            console.error('Terminal container not found in DOM');
        }
    }, [appId, podDetails]);

    // Refit terminal on fullscreen toggle
    useEffect(() => {
        if (
            fitAddonRef.current &&
            containerRef.current &&
            containerRef.current.offsetWidth > 0 &&
            containerRef.current.offsetHeight > 0 &&
            terminal &&
            !terminal._disposed
        ) {
            try {
                fitAddonRef.current.fit();
                console.log('Terminal fitted successfully (fullscreen toggle)');
            } catch (error) {
                console.error('Error fitting terminal on fullscreen toggle:', error);
            }
        } else {
            if (!fitAddonRef.current) console.warn('fitAddonRef.current is missing (fullscreen)');
            if (!containerRef.current) console.warn('containerRef.current is missing (fullscreen)');
            if (containerRef.current && (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0)) console.warn('containerRef.current has zero size (fullscreen)');
            if (!terminal) console.warn('terminal is missing (fullscreen)');
            if (terminal && terminal._disposed) console.warn('terminal is disposed (fullscreen)');
        }
    }, [isFullscreen, terminal]);

    return (
        <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-2xl ${
            isFullscreen ? 'fixed inset-4 z-50' : 'h-[600px]'
        }`}>
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <TerminalIcon className="w-5 h-5 text-blue-400" />
                            <span className="text-white font-medium">Pod Shell</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                            <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
                                {getStatusIcon()}
                                <span className="capitalize">{connectionStatus}</span>
                            </div>
                        </div>

                        <div className="text-xs text-gray-400">
                            <span className="bg-gray-700 px-2 py-1 rounded">
                                {podDetails.podName}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="bg-gray-700 px-2 py-1 rounded">
                                {podDetails.container}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-400">
                            Uptime: {formatUptime(sessionInfo.startTime)} • Commands: {sessionInfo.commandCount}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={handleReconnect}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                title="Reconnect"
                                disabled={connectionStatus === 'connecting'}
                            >
                                <RefreshCw className={`w-4 h-4 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
                            </button>
                            
                            <button
                                onClick={handleClearTerminal}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                title="Clear Terminal"
                            >
                                <Download className="w-4 h-4 rotate-180" />
                            </button>
                            
                            <button
                                onClick={handleCopySession}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                title="Copy Selection"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            
                            <button
                                onClick={toggleFullscreen}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                title="Toggle Fullscreen"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terminal Container */}
            <div className="relative bg-[#0d1117] h-full">
                <div 
                    ref={containerRef} 
                    className="h-full w-full p-4"
                    style={{ 
                        minHeight: isFullscreen ? 'calc(100vh - 120px)' : '520px',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace'
                    }}
                />
                
                {/* Connection overlay */}
                {connectionStatus === 'connecting' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-gray-800 rounded-lg p-6 text-center">
                            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
                            <p className="text-white font-medium">Connecting to pod shell...</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {podDetails.podName}
                            </p>
                        </div>
                    </div>
                )}

                {connectionStatus === 'error' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-gray-800 rounded-lg p-6 text-center">
                            <WifiOff className="w-8 h-8 text-red-400 mx-auto mb-3" />
                            <p className="text-white font-medium">Connection Failed</p>
                            <p className="text-gray-400 text-sm mt-1 mb-4">
                                Unable to connect to pod shell
                            </p>
                            <button
                                onClick={handleReconnect}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};