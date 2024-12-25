import React, { useState } from 'react';
import { X, Play, GitCommit } from 'lucide-react';
import { mockCommits } from '../../data/mockCommits';

export default function BuildModal({ onClose, onStartBuild }) {
  const [selectedCommit, setSelectedCommit] = useState(mockCommits[0]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-[600px]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Start New Build</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Select a commit to build</h3>
          <div className="space-y-2">
            {mockCommits.map((commit) => (
              <div
                key={commit.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCommit.id === commit.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedCommit(commit)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <GitCommit className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{commit.message}</p>
                      <p className="text-sm text-gray-500">
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{commit.hash}</code> • {commit.author} • {commit.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Selected commit: <code className="bg-gray-100 px-1 py-0.5 rounded">{selectedCommit.hash}</code>
          </div>
          <button
            onClick={onStartBuild}
            className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start Build</span>
          </button>
        </div>
      </div>
    </div>
  );
}