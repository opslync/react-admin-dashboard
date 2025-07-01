import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Dialog, DialogContent, DialogOverlay } from "../ui/dialog";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { getMethod, postMethod } from "../../library/api";
import OrganizationSetupStep from "./steps/OrganizationSetupStep";
import ClusterSetupStep from "./steps/ClusterSetupStep";
import ProjectCreateStep from "./steps/ProjectCreateStep";

const ONBOARDING_STEPS = [
  {
    id: "organization",
    title: "Organization Setup",
    component: OrganizationSetupStep,
  },
  {
    id: "cluster",
    title: "Add Kubernetes Cluster",
    component: ClusterSetupStep,
  },
  { id: "project", title: "Create Project", component: ProjectCreateStep },
];

const OnboardingFlow = ({ open, onClose, onComplete }) => {
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [onboardingData, setOnboardingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      fetchOnboardingStatus();
    }
  }, [open]);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await getMethod("onboarding/status");
      const { completed_steps, current_step, data } = response.data;

      setCompletedSteps(new Set(completed_steps || []));
      setCurrentStep(current_step || 0);
      setOnboardingData(data || {});
    } catch (error) {
      console.error("Failed to fetch onboarding status:", error);
    }
  };

  const startOnboarding = async () => {
    try {
      await postMethod("onboarding/start");
      setCurrentStep(0);
      setCompletedSteps(new Set());
    } catch (error) {
      console.error("Failed to start onboarding:", error);
      setError("Failed to start onboarding process");
    }
  };

  const completeStep = async (stepId, stepData = {}) => {
    try {
      setLoading(true);
      await postMethod("onboarding/complete-step", {
        step: stepId,
        data: stepData,
      });

      setCompletedSteps((prev) => new Set([...prev, stepId]));
      setOnboardingData((prev) => ({ ...prev, [stepId]: stepData }));

      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to complete step:", error);
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
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
    history.push("/dashboard");
  };

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep]?.component;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
      maxWidth="full"
      fullWidth
      className="bg-white"
    >
      <DialogOverlay className="bg-gray-50" />
      <DialogContent className="max-w-4xl mx-auto h-auto p-20 bg-gray-50 max-h-[80vh] overflow-y-auto">
        {/* Header with Navigation */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-3 py-1 text-sm"
              >
                ← Previous
              </Button>
              <span className="text-gray-600 text-sm">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === ONBOARDING_STEPS.length - 1}
                className="px-3 py-1 text-sm"
              >
                Next →
              </Button>
            </div>
            <h3 className="text-gray-900 text-sm font-medium">
              {ONBOARDING_STEPS[currentStep]?.title}
            </h3>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>
        </div>

        {/* Step Content */}
        <div className="px-8 pb-8">
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
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;
