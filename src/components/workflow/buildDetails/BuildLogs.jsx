import React, { useEffect, useRef } from 'react';

export default function BuildLogs({ logs }) {
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

  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-[400px] overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="py-1">
          <span className="text-gray-500">[{log.timestamp}]</span>{' '}
          <span className={getLogColor(log.level)}>{log.message}</span>
        </div>
      ))}
      <div ref={logsEndRef} />
    </div>
  );
} 