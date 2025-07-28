import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatTimeAgo } from '../../../utils/formatters';

export default function BuildHistoryList({ builds, currentBuildId, onBuildSelect }) {
  console.log(builds, "checkin builds ------ buildhistorylist");
  const getStatusIcon = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'success':
      case 'succeeded':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case '':
        return <Clock className="w-5 h-5 text-gray-400" />; // Neutral icon for unknown
      default:
        return <Clock className="w-5 h-5 text-gray-400" />; // Neutral icon for unknown
    }
  };

  function getStatusText(status, duration) {
    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus === 'succeeded' || normalizedStatus === 'success') {
      return `Success${duration && duration !== '...' ? ' • ' + duration : ''}`;
    }
    if (normalizedStatus === 'failed') {
      return `Failed${duration && duration !== '...' ? ' • ' + duration : ''}`;
    }
    if (normalizedStatus === 'running' || normalizedStatus === 'pending') {
      return 'In progress...';
    }
    if (!status) {
      return 'Status Unknown';
    }
    return duration || 'Status Unknown';
  }

  return (
    <div className="space-y-2">
      {builds.map((build) => (
        <div
          key={build.id}
          className={`p-3 rounded-lg border cursor-pointer hover:border-blue-300 transition-colors ${
            build.id === currentBuildId
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200'
          }`}
          onClick={() => onBuildSelect(build.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(build.status)}
              <div>
                <p className="font-medium text-gray-900">
                  {build.commitMessage}
                </p>
                <p className="text-sm text-gray-500">
                  {build.commitHash} • {build.branch} • {getStatusText(build.status, build.duration)}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">{formatTimeAgo(build.finishedAt || build.endAt || build.startTime)}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 