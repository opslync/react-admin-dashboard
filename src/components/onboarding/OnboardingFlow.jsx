import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Dialog, DialogContent, DialogOverlay } from "../ui/dialog";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { getMethod, postMethod } from "../../library/api";
import OrganizationSetupStep from "./steps/OrganizationSetupStep";
import ClusterSetupStep from "./steps/ClusterSetupStep";
import ProjectCreateStep from "./steps/ProjectCreateStep";
import WelcomeStep from "./steps/WelcomeStep";
import onboardingManager from "../../utils/onboardingManager";
import { toast } from "react-toastify";
import { CheckCircle } from "lucide-react";

const ONBOARDING_STEPS = [
  {
    id: "organization",
    title: "Organization Creation",
    component: OrganizationSetupStep,
  },
  {
    id: "cluster",
    title: "Add Kubernetes Cluster",
    component: ClusterSetupStep,
  },
  {
    id: "project",
    title: "Project Creation",
    component: ProjectCreateStep,
  },
];

const OnboardingFlow = ({ open, onClose, onComplete }) => {
  const history = useHistory();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [onboardingData, setOnboardingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const projectStepRef = useRef();

  useEffect(() => {
    if (open) {
      setShowWelcome(true);
      setCurrentStep(0);
      fetchOnboardingStatus();
    }
  }, [open]);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await getMethod("onboarding/status");
      const { completed_steps, data } = response.data;
      const completedSet = new Set(completed_steps || []);
      setCompletedSteps(completedSet);
      setOnboardingData(data || {});
      setShowWelcome(!(completed_steps && completed_steps.length > 0));
      // Find the first incomplete step
      let firstIncompleteIdx = ONBOARDING_STEPS.findIndex(
        (step) => !completedSet.has(step.id)
      );
      if (firstIncompleteIdx === -1) firstIncompleteIdx = ONBOARDING_STEPS.length - 1; // all done, show last step
      setCurrentStep(firstIncompleteIdx >= 0 ? firstIncompleteIdx : 0);
    } catch (error) {
      setShowWelcome(true);
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setOnboardingData({});
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
    // Force-close select if on project step
    if (ONBOARDING_STEPS[currentStep]?.id === "project") {
      projectStepRef.current?.closeSelect?.();
    }
    try {
      setLoading(true);
      await postMethod("onboarding/complete-step", {
        step: stepId,
        data: stepData,
      });
      setCompletedSteps((prev) => new Set([...prev, stepId]));
      setOnboardingData((prev) => {
        const newData = { ...prev, [stepId]: stepData };
        return newData;
      });
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleComplete();
      }
    } catch (error) {
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
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    console.log("OnboardingFlow - handleComplete called");
    try {
      const finalStatus = await onboardingManager.checkOnboardingStatus();
      console.log("OnboardingFlow - Final status check before completion:", finalStatus);
      
      if (!finalStatus.needsOnboarding) {
        console.log("OnboardingFlow - All steps completed, proceeding with completion");
        
        toast.success("🎉 Onboarding completed successfully! Welcome to Opslync!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        console.log("OnboardingFlow - Redirecting to /overview");
        onComplete?.();
        onClose();
        history.push("/overview");
      } else {
        console.log("OnboardingFlow - Onboarding still incomplete, not completing");
        setError("Please complete all required steps before finishing onboarding.");
      }
    } catch (error) {
      console.error("OnboardingFlow - Error checking final status:", error);
      onComplete?.();
      onClose();
      history.push("/overview");
    }
  };

  const handleClose = () => {
    // Check if onboarding is completed
    const isCompleted = completedSteps.size === ONBOARDING_STEPS.length;
    
    if (!isCompleted) {
      // Logout user if onboarding is not completed
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("registration-onboarding-completed");
      
      // Clear any other user-related data
      sessionStorage.clear();
      
      // Show logout message
      toast.info("You have been logged out. Please complete onboarding to access the application.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Redirect to login page and refresh after a short delay
      setTimeout(() => {
        window.location.replace("/");
      }, 1000); // 1 second delay
      return;
    }
    
    // Call the original onClose function
    onClose?.();
  };

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep]?.component;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  if (showWelcome) {
    return (
      <Dialog open={open} onOpenChange={handleClose} maxWidth="full" fullWidth className="bg-white">
        <DialogOverlay className="bg-gray-50" />
        <DialogContent className="overflow-y-auto max-h-[100vh] max-w-4xl mx-auto">
          <WelcomeStep
            onComplete={() => setShowWelcome(false)}
            onNext={() => setShowWelcome(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      maxWidth="full"
      fullWidth
      className="bg-white"
    >
      <DialogOverlay className="bg-gray-50" />
      <DialogContent className="max-w-4xl mx-auto p-0 bg-white">
        {/* Stepper Navigation (fixed at top) */}
        <div className="pt-8 px-8">
          <div className="flex justify-center items-center mb-6 w-full max-w-2xl mx-auto">
            {ONBOARDING_STEPS.map((step, idx) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = idx === currentStep;
              const isUpcoming = idx > currentStep && !isCompleted;
              const isClickable = !isCompleted && idx <= currentStep + 1;
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    aria-label={step.title + (isCompleted ? ' completed' : isCurrent ? ' current' : '')}
                    className={`flex flex-col items-center focus:outline-none bg-transparent border-none px-2 sm:px-4 transition-colors duration-150 ${
                      isCurrent
                        ? 'text-blue-700 font-bold'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                    disabled={!isClickable}
                    onClick={() => isClickable && goToStep(idx)}
                    style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
                  >
                    <div className={`w-9 h-9 flex items-center justify-center rounded-full mb-1 border-2 transition-all duration-150 ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : isCompleted
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-500" aria-label="Completed" />
                      ) : (
                        <span className={`text-base font-semibold ${isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs text-center whitespace-nowrap ${
                      isCurrent
                        ? 'font-bold text-blue-700'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                  {idx < ONBOARDING_STEPS.length - 1 && (
                    <div className="flex-grow h-1 mx-1 sm:mx-2" style={{ minWidth: 24 }}>
                      <div className={`w-full h-full rounded transition-colors duration-150 ${
                        completedSteps.has(ONBOARDING_STEPS[idx + 1].id)
                          ? 'bg-green-400'
                          : isCurrent
                          ? 'bg-blue-300'
                          : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Progress Bar (fixed below stepper) */}
          <div className="w-full mb-2">
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>
        </div>
        {/* Step Content (scrollable) */}
        <div className="px-8 pb-8 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {CurrentStepComponent && (
            <CurrentStepComponent
              ref={ONBOARDING_STEPS[currentStep]?.id === "project" ? projectStepRef : undefined}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onComplete={completeStep}
              onFinish={handleComplete}
              stepData={(() => {
                const stepData = {
                  ...onboardingData[ONBOARDING_STEPS[currentStep].id] || {},
                  ...(ONBOARDING_STEPS[currentStep].id === "cluster" && {
                    organizationId: onboardingData.organization?.organizationId || onboardingData.organization?.id
                  }),
                  ...(ONBOARDING_STEPS[currentStep].id === "project" && {
                    organizationId: onboardingData.organization?.organizationId || onboardingData.organization?.id,
                    clusterId: onboardingData.cluster?.clusterId,
                    clusterName: onboardingData.cluster?.clusterName,
                    clusterEndpoint: onboardingData.cluster?.clusterEndpoint,
                    clusters: onboardingData.clusters || (onboardingData.cluster ? [onboardingData.cluster] : [])
                  })
                };
                console.log("OnboardingFlow - Passing stepData to", ONBOARDING_STEPS[currentStep].id, ":", stepData);
                console.log("OnboardingFlow - Organization data available:", onboardingData.organization);
                return stepData;
              })()}
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
