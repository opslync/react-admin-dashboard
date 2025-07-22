import React, { useState, useEffect } from 'react';
import { X, Play, GitCommit } from 'lucide-react';
import { postMethod, getMethod } from '../../library/api';
import { useParams } from 'react-router-dom';
import githubTokenManager from '../../utils/githubTokenManager';
import axios from 'axios';

export default function BuildModal({ open, onClose, onStartBuild, appId: propAppId, appDetails: propAppDetails }) {
  const { appId: routeAppId } = useParams();
  const appId = propAppId || routeAppId;
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appDetails, setAppDetails] = useState(propAppDetails);
  const [isStartingBuild, setIsStartingBuild] = useState(false);

  useEffect(() => {
    fetchAppDetails();
  }, [appId]);

  const fetchAppDetails = async () => {
    try {
      const response = await getMethod(`app/${appId}`);
      setAppDetails(response.data);
      fetchCommits(response.data);
    } catch (err) {
      setError('Failed to fetch app details');
      setLoading(false);
    }
  };

  const fetchCommits = async (appData) => {
    try {
      const repoUrl = appData.repoUrl.replace(/\.git$/, '');
      const branch = appData.branch || 'main';
      let commits = [];
      if (appData.repoType === 'public' || (!appData.repoType && repoUrl.includes('github.com'))) {
        // Public repo: fetch from GitHub API
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const [, owner, repo] = match;
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=10`;
          const response = await axios.get(apiUrl);
          commits = response.data.map(commit => ({
            id: commit.sha,
            hash: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date
          }));
        }
      } else {
        // Private repo: use backend
        const githubToken = await githubTokenManager.waitForToken(5000);
        if (!githubToken) {
          setError('GitHub token not available. Please setup GitHub integration in Settings.');
          setLoading(false);
          return;
        }
        const payload = {
          github_token: githubToken,
          repo_url: repoUrl,
          branch: branch
        };
        const response = await postMethod('user/github/commits', payload);
        commits = response.data.map(commit => ({
          id: commit.hash,
          hash: commit.hash,
          message: commit.message,
          author: commit.author,
          date: commit.date
        }));
      }
      setCommits(commits);
      setSelectedCommit(commits[0]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch commits. Please check your GitHub integration or repo URL.');
      setLoading(false);
    }
  };

  const handleStartBuild = async () => {
    if (!selectedCommit || !appDetails) return;

    setIsStartingBuild(true);
    try {
      // Get the GitHub token from the token manager
      const githubToken = githubTokenManager.getCurrentToken();
      const buildPayload = {
        pipeline_id: "456", // This should come from your pipeline configuration
        commit_id: selectedCommit.hash,
        commit_message: selectedCommit.message,
        github_token: githubToken, // <-- Include the GitHub token in the payload
        params: {
          "repo-url": appDetails.repoUrl,
          "branch": appDetails.branch || 'main',
          "commit": selectedCommit.hash,
          "dockerfile-path": "Dockerfile",
          "image-name": `opslync/${appDetails.name}`,
          "image-tag": selectedCommit.hash
        }
      };

      const response = await postMethod(`app/${appId}/workflows/build/start`, buildPayload);
      onClose();
      if (onStartBuild) {
        onStartBuild(selectedCommit, response.data?.workflowID);
      }
    } catch (err) {
      setError('Failed to start build. Please try again.');
    } finally {
      setIsStartingBuild(false);
    }
  };

  if (!open) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading commits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!appDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600 mb-4">Failed to load app details</p>
          <button
            onClick={onClose}
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const displayRepoUrl = appDetails.repoUrl.replace(/\.git$/, '');

  return (
    <div className="z-[9999] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Select a commit from{' '}
            <a 
              href={displayRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {displayRepoUrl}
            </a>{' '}
            ({appDetails.branch || 'main'})
          </h3>
          <div className="space-y-2">
            {commits.map((commit) => (
              <div
                key={commit.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCommit?.id === commit.id
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
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{commit.hash.slice(0, 7)}</code> • {commit.author} • {commit.date}
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
            Selected commit: <code className="bg-gray-100 px-1 py-0.5 rounded">{selectedCommit?.hash.slice(0, 7)}</code>
          </div>
          <button
            onClick={handleStartBuild}
            disabled={isStartingBuild || !selectedCommit}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              isStartingBuild || !selectedCommit
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{isStartingBuild ? 'Starting Build...' : 'Start Build'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}