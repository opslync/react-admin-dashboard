import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function BuildHistoryList({ builds, currentBuildId }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {builds.map((build) => (
        <div
          key={build.id}
          className={`p-3 rounded-lg border ${
            build.id === currentBuildId
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(build.status)}
              <div>
                <p className="font-medium text-gray-900">
                  {build.commitMessage}
                </p>
                <p className="text-sm text-gray-500">
                  {build.commitHash} • {build.branch} • {build.duration}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">{build.startTime}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 