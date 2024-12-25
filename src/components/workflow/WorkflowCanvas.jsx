import React, { useState } from 'react';
import { ArrowRight, GitBranch, Package, Upload } from 'lucide-react';
import WorkflowNode from './WorkflowNode';
import ConfigPanel from './ConfigPanel';
import BuildModal from './BuildModal';
import BuildDetailsPage from './buildDetails/BuildDetailsPage';
import { initialSteps, initialConnections } from '../../data/initialWorkflowData';

export default function WorkflowCanvas() {
  const [steps, setSteps] = useState(initialSteps);
  const [connections, setConnections] = useState(initialConnections);
  const [selectedStep, setSelectedStep] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showBuildDetails, setShowBuildDetails] = useState(false);

  const handleStepClick = (step) => {
    if (step.type === 'build') {
      setShowBuildModal(true);
    } else {
      setSelectedStep(step);
    }
  };

  const handleStartBuild = () => {
    setShowBuildModal(false);
    setShowBuildDetails(true);
  };

  if (showBuildDetails) {
    return <BuildDetailsPage onBack={() => setShowBuildDetails(false)} />;
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
    <div className="flex h-screen bg-gray-50 ml-64">
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
          onClose={() => setShowBuildModal(false)}
          onStartBuild={handleStartBuild}
        />
      )}
    </div>
  );
}