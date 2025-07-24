import React, { useState, useEffect } from 'react';
import { ArrowRight, GitBranch, Package, Upload } from 'lucide-react';
import WorkflowNode from './WorkflowNode';
import ConfigPanel from './ConfigPanel';
import BuildModal from './BuildModal';
import { getMethod, postMethod } from '../../library/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import * as ScrollArea from '@radix-ui/react-scroll-area';

export default function WorkflowCanvas({ onBuildClick, appId }) {
  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBuilds, setRecentBuilds] = useState([]);
  const [deployLoading, setDeployLoading] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [deployError, setDeployError] = useState(null);

  useEffect(() => {
    const fetchAppDetails = async () => {
      try {
        const response = await getMethod(`app/${appId}`);
        const appDetails = response.data;
        const githubToken = localStorage.getItem('github_token');

        // Fetch recent builds
        const buildsResponse = await getMethod(`app/${appId}/workflows/builds`);
        const recentBuilds = buildsResponse.data.slice(0, 4).map(build => ({
          ...build,
          status: build.status ? build.status.toLowerCase() : build.status,
        })); // Normalize status to lowercase
        setRecentBuilds(recentBuilds);

        console.log(recentBuilds, "checkin build status ------ workflowcanvas");

        const workflowSteps = [
          {
            id: 'source',
            type: 'source',
            title: 'Source',
            description: 'Git repository configuration',
            icon: 'git',
            config: {
              repository: appDetails.repoUrl || 'Not configured',
              branch: appDetails.branch || 'main',
              credentials: '••••••••'
            }
          },
          {
            id: 'build',
            type: 'build',
            title: 'Build',
            description: 'Build configuration and settings',
            icon: 'build',
            config: {
              dockerfile: 'Dockerfile',
              buildArgs: ['NODE_ENV=production'],
              cache: true
            }
          },
          {
            id: 'deploy',
            type: 'deploy',
            title: 'Deploy',
            description: 'Deployment configuration',
            icon: 'deploy',
            config: {
              environment: 'production',
              replicas: 3,
              resources: {
                cpu: '1',
                memory: '2Gi'
              }
            }
          }
        ];

        setSteps(workflowSteps);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch app details');
        setLoading(false);
      }
    };

    if (appId) {
      fetchAppDetails();
    }
  }, [appId]);

  const handleStepClick = (step) => {
    if (step.type === 'build') {
      setShowBuildModal(true);
    } else if (step.type === 'deploy') {
      setShowDeployModal(true);
    } else {
      setSelectedStep(step);
    }
  };

  const handleStartBuild = (workflowId) => {
    setShowBuildModal(false);
    if (onBuildClick) {
      onBuildClick(workflowId);
    }
  };

  const handleDeploy = async () => {
    if (!selectedBuild) {
      setDeployError('Please select a build to deploy');
      return;
    }
    setDeployError(null);
    setDeployLoading(true);
    try {
      await postMethod(`app/${appId}/deploy`, {
        "tag": selectedBuild.commitId,
        "ingress.enabled": "false"
      });
      setShowDeployModal(false);
      // Redirect to deployment history page
      window.location.href = `/app/${appId}/deployment-history`;
    } catch (err) {
      setDeployError(err.response?.data?.message || 'Failed to deploy application. Please try again.');
    } finally {
      setDeployLoading(false);
    }
  };

  const DeployModal = () => (
    <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Deploy Application</DialogTitle>
        </DialogHeader>
        
        <ScrollArea.Root className="max-h-[400px] mt-4 overflow-hidden">
          <ScrollArea.Viewport className="h-full w-full">
            <div className="space-y-3 pr-4">
              {recentBuilds.map((build) => (
                <div 
                  key={build.workflowID} 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer bg-white transition-all ${
                    selectedBuild?.workflowID === build.workflowID 
                      ? 'border-blue-500 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                  onClick={() => setSelectedBuild(build)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {build.commitMessage}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                        {build.commitId}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(build.startTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors hover:bg-gray-200"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>

        {deployError && (
          <div className="mt-4 text-sm text-red-600">
            {deployError}
          </div>
        )}

        <DialogFooter className="mt-4 border-t pt-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowDeployModal(false)}
            className="border-gray-200 hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={deployLoading || !selectedBuild}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {deployLoading ? 'Deploying...' : 'Deploy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return <div className="text-gray-600">Loading workflow...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const getStepIcon = (type) => {
    switch (type) {
      case 'source':
        return <GitBranch className="w-8 h-8 text-blue-600" />;
      case 'build':
        return <Package className="w-8 h-8 text-blue-600" />;
      case 'deploy':
        return <Upload className="w-8 h-8 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <WorkflowNode
                step={step}
                icon={getStepIcon(step.type)}
                onClick={() => handleStepClick(step)}
                onDragStart={() => setDragging(step.id)}
                onBuild={step.type === 'build' ? () => setShowBuildModal(true) : undefined}
              />
              {index < steps.length - 1 && (
                <ArrowRight className="w-8 h-8 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {selectedStep && (
        <ConfigPanel
          step={selectedStep}
          onClose={() => setSelectedStep(null)}
        />
      )}

      {showBuildModal && (
        <BuildModal
          open={showBuildModal}
          onClose={() => setShowBuildModal(false)}
          onStartBuild={handleStartBuild}
          appId={appId}
        />
      )}

      <DeployModal />
    </div>
  );
}