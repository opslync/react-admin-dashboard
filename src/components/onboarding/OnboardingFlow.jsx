import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { getMethod, postMethod } from '../../library/api';
import WelcomeStep from './steps/WelcomeStep';
import GitHubSetupStep from './steps/GitHubSetupStep';
import ClusterSetupStep from './steps/ClusterSetupStep';
import ProjectCreateStep from './steps/ProjectCreateStep';
import CompletionStep from './steps/CompletionStep';

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'github', title: 'GitHub Setup', component: GitHubSetupStep },
  { id: 'cluster', title: 'Cluster Setup', component: ClusterSetupStep },
  { id: 'project', title: 'First Project', component: ProjectCreateStep },
  { id: 'complete', title: 'Complete', component: CompletionStep }
];

const OnboardingFlow = ({ open, onClose, onComplete }) => {
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [onboardingData, setOnboardingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchOnboardingStatus();
    }
  }, [open]);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await getMethod('onboarding/status');
      const { completed_steps, current_step, data } = response.data;
      
      setCompletedSteps(new Set(completed_steps || []));
      setCurrentStep(current_step || 0);
      setOnboardingData(data || {});
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    }
  };

  const startOnboarding = async () => {
    try {
      await postMethod('onboarding/start');
      setCurrentStep(0);
      setCompletedSteps(new Set());
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      setError('Failed to start onboarding process');
    }
  };

  const completeStep = async (stepId, stepData = {}) => {
    try {
      setLoading(true);
      await postMethod('onboarding/complete-step', {
        step: stepId,
        data: stepData
      });
      
      setCompletedSteps(prev => new Set([...prev, stepId]));
      setOnboardingData(prev => ({ ...prev, [stepId]: stepData }));
      
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
      setError(`Failed to complete ${stepId} step`);
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
    history.push('/overview');
  };

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep]?.component;
  const progress = ((completedSteps.size) / ONBOARDING_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose} maxWidth="lg" fullWidth>
      <DialogContent className="max-w-4xl p-0 bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Opslync</h2>
            <p className="text-gray-600">Let's get you set up in just a few steps</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center justify-between">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    completedSteps.has(step.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                      ? 'border-blue-500 text-blue-500 bg-blue-50'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {completedSteps.has(step.id) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                <span className={`ml-2 text-sm font-medium ${
                  index === currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 p-6">
          {CurrentStepComponent && (
            <CurrentStepComponent
              onNext={handleNext}
              onPrevious={handlePrevious}
              onComplete={completeStep}
              onFinish={handleComplete}
              stepData={onboardingData[ONBOARDING_STEPS[currentStep].id] || {}}
              isLoading={loading}
              error={error}
              setError={setError}
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center p-6 border-t bg-white">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-600"
            >
              Skip for now
            </Button>
            
            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <Button
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Get Started
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <>Next</>
                )}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow; 