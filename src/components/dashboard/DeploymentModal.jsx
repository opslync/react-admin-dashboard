import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { X, GitBranch, Package, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { getMethod, postMethod } from '../../library/api';
import { listApps } from '../../library/constant';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

// Add a helper to format relative time
function getRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  const now = new Date();
  const updated = new Date(dateString);
  const diffMs = now - updated;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hours ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} days ago`;
}

export const DeploymentModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('selectApp');
  const [selectedApp, setSelectedApp] = useState(null);
  const [deploymentType, setDeploymentType] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [builds, setBuilds] = useState([]);
  const [buildsLoading, setBuildsLoading] = useState(false);
  const [buildsError, setBuildsError] = useState('');
  const history = useHistory();

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep('selectApp');
      setSelectedApp(null);
      setDeploymentType(null);
      setSelectedVersion(null);
      setIsDeploying(false);
      setApps([]);
      setLoading(false);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchAppsAndStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMethod(listApps);
        const appList = Array.isArray(response.data) ? response.data : [];
        // Set initial apps with status 'inactive'
        if (isMounted) {
          setApps(appList.map(app => ({
            id: app.ID,
            name: app.name,
            lastDeployed: getRelativeTime(app.UpdatedAt),
            status: 'inactive',
            projectName: app.projectName,
            branch: app.branch,
            repoUrl: app.repoUrl,
          })));
        }
        // Fetch pod status for each app in parallel, update as they arrive
        appList.forEach(async (app) => {
          let status = 'inactive';
          try {
            const podStatusRes = await getMethod(`app/${app.ID}/pod/status`);
            if (Array.isArray(podStatusRes.data) && podStatusRes.data.some(pod => pod.status === 'Running')) {
              status = 'active';
            }
          } catch (e) {
            // ignore error, keep status as inactive
          }
          if (isMounted) {
            setApps(prevApps => prevApps.map(a => a.id === app.ID ? { ...a, status } : a));
          }
        });
      } catch (err) {
        setError('Failed to fetch applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppsAndStatus();
    return () => { isMounted = false; };
  }, [isOpen]);

  const handleAppSelect = (app) => {
    setSelectedApp(app);
    setStep('selectVersion');
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
    setStep('confirm');
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(false);
    onClose();
    // Show deployment feedback using toast.success
    toast.success('Deployment started successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleBack = () => {
    if (step === 'selectVersion') {
      setStep('selectApp');
      setSelectedApp(null);
    } else if (step === 'confirm') {
      setStep('selectVersion');
      setSelectedVersion(null);
    }
  };

  const handleGitSelect = async () => {
    setDeploymentType('git');
    setBuilds([]);
    setBuildsError('');
    setBuildsLoading(true);
    try {
      if (!selectedApp) return;
      const response = await getMethod(`app/${selectedApp.id}/workflows/builds`);
      setBuilds(Array.isArray(response.data.builds) ? response.data.builds : []);
    } catch (err) {
      setBuildsError('Failed to fetch builds.');
    } finally {
      setBuildsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Deploy Application</h2>
              <p className="text-sm text-gray-600">
                {step === 'selectApp' && 'Select an application to deploy'}
                {step === 'selectVersion' && 'Choose deployment version'}
                {step === 'confirm' && 'Confirm deployment details'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'selectApp' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'selectApp' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {step === 'selectApp' ? '1' : <Check className="w-3 h-3" />}
              </div>
              <span className="text-sm font-medium">Select App</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${
              step === 'selectVersion' ? 'text-blue-600' : 
              step === 'confirm' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'selectVersion' ? 'bg-blue-100 text-blue-600' :
                step === 'confirm' ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step === 'confirm' ? <Check className="w-3 h-3" /> : '2'}
              </div>
              <span className="text-sm font-medium">Select Version</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'confirm' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {step === 'selectApp' && (
            <div className="space-y-3">
              {loading && <div className="text-center text-gray-500">Loading applications...</div>}
              {error && <div className="text-center text-red-500">{error}</div>}
              {!loading && !error && apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleAppSelect(app)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      app.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Package className={`w-5 h-5 ${
                        app.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{app.name}</h3>
                      <p className="text-xs text-gray-500">Last deployed: {app.lastDeployed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'selectVersion' && selectedApp && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-1">Selected Application</h3>
                <p className="text-blue-700">{selectedApp.name}</p>
              </div>
              {/* Deployment Type Selection */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Choose Deployment Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleGitSelect}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      deploymentType === 'git' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <GitBranch className="w-8 h-8 text-blue-500 mb-2" />
                    <h4 className="font-medium text-gray-900">Git Version</h4>
                    <p className="text-sm text-gray-600">Deploy from Git branch</p>
                  </button>
                  <button
                    disabled
                    className="p-4 border-2 rounded-lg transition-all duration-200 opacity-50 cursor-not-allowed border-gray-200 bg-gray-100"
                  >
                    <Package className="w-8 h-8 text-purple-500 mb-2" />
                    <h4 className="font-medium text-gray-900">Docker Image</h4>
                    <p className="text-sm text-gray-600">(Temporarily disabled)</p>
                  </button>
                </div>
              </div>
              {/* Build Selection */}
              {deploymentType === 'git' && (
                <div className="space-y-3">
                  {buildsLoading && <div className="text-center text-gray-500">Loading builds...</div>}
                  {buildsError && <div className="text-center text-red-500">{buildsError}</div>}
                  {!buildsLoading && !buildsError && builds.length === 0 && (
                    <div className="text-center text-gray-500">No builds found.</div>
                  )}
                  {!buildsLoading && !buildsError && builds.length > 0 && (
                    <div className="space-y-2">
                      {builds
                        .filter(build => ['success', 'succeeded'].includes(String(build.status).toLowerCase()))
                        .map((build) => (
                          <div
                            key={build.id}
                            onClick={() => handleVersionSelect(build)}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedVersion?.id === build.id
                                ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{build.commitMessage}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">{build.commitId}</span>
                                <span className="text-xs text-gray-500">{build.startTime ? getRelativeTime(build.startTime) : ''}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && selectedApp && selectedVersion && (
            <div className="bg-green-50 rounded-xl p-8 shadow-md">
              <h3 className="font-bold text-green-900 text-lg mb-6">Deployment Summary</h3>
              <div className="grid grid-cols-2 gap-y-4 text-green-900 text-base">
                <div>Application:</div>
                <div className="text-right">{selectedApp.name}</div>
                <div>Type:</div>
                <div className="text-right">{deploymentType === 'git' ? 'Git' : deploymentType}</div>
                <div>Version:</div>
                <div className="text-right">{selectedVersion.branch || selectedVersion.commitId || '-'}</div>
                <div>Environment:</div>
                <div className="text-right">Production</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {step !== 'selectApp' && (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {step === 'confirm' && (
              <Button 
                onClick={handleDeploy}
                disabled={isDeploying}
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center min-w-[120px]"
              >
                {isDeploying ? (
                  <>
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span>Deploying...</span>
                  </>
                ) : (
                  'Deploy Now'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
