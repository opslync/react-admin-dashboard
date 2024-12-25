import React from 'react';
import { ArrowLeft } from 'lucide-react';
import BuildHistoryList from './BuildHistoryList';
import BuildLogs from './BuildLogs';
import { mockBuildHistory, mockBuildLogs } from '../../../data/mockBuildData';

export default function BuildDetailsPage({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6 ml-64">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Build Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Build History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Build History</h2>
            <BuildHistoryList
              builds={mockBuildHistory}
              currentBuildId="build-5"
            />
          </div>

          {/* Live Logs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Build Logs</h2>
            <BuildLogs logs={mockBuildLogs} />
          </div>
        </div>
      </div>
    </div>
  );
} 