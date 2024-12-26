import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, X } from 'lucide-react';

export default function BuildLogs({ logs }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-200';
    }
  };

  const LogContent = () => (
    <>
      {logs.map((log) => (
        <div key={log.id} className="py-1">
          <span className="text-gray-500">[{log.timestamp}]</span>{' '}
          <span className={getLogColor(log.level)}>{log.message}</span>
        </div>
      ))}
      <div ref={logsEndRef} />
    </>
  );

  return (
    <>
      <div className="relative">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-[400px] overflow-y-auto">
          <LogContent />
        </div>
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Open in fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-[90vw] h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-gray-200 font-medium">Build Logs</h3>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              <LogContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 