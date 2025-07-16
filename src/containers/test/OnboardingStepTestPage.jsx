import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import all onboarding step components
import WelcomeStep from "../../components/onboarding/steps/WelcomeStep";
import OrganizationSetupStep from "../../components/onboarding/steps/OrganizationSetupStep";
import ClusterSetupStep from "../../components/onboarding/steps/ClusterSetupStep";
import ProjectCreateStep from "../../components/onboarding/steps/ProjectCreateStep";
import GitHubSetupStep from "../../components/onboarding/steps/GitHubSetupStep";
import CompletionStep from "../../components/onboarding/steps/CompletionStep";

const OnboardingStepTestPage = () => {
  const { step } = useParams();

  const handleNext = () => {
    console.log("Next button clicked");
  };

  const handlePrevious = () => {
    console.log("Previous button clicked");
  };

  const handleComplete = (stepId, data) => {
    console.log("Step completed:", stepId, data);
  };

  const handleFinish = () => {
    console.log("Onboarding finished");
  };

  const renderStep = () => {
    const commonProps = {
      onNext: handleNext,
      onPrevious: handlePrevious,
      onComplete: handleComplete,
      onFinish: handleFinish,
      stepData: {},
      isLoading: false,
      error: null,
      setError: () => {},
    };

    switch (step) {
      case "welcome":
        return <WelcomeStep {...commonProps} />;
      case "organization":
        return <OrganizationSetupStep {...commonProps} />;
      case "cluster":
        return <ClusterSetupStep {...commonProps} />;
      case "project":
        return <ProjectCreateStep {...commonProps} />;
      case "github":
        return <GitHubSetupStep {...commonProps} />;
      case "completion":
        return <CompletionStep {...commonProps} />;
      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Step
            </h2>
            <p className="text-gray-600">
              Available steps: welcome, organization, cluster, project, github,
              completion
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Onboarding Step Test: {step}
              </h1>
              <p className="text-gray-600">
                Testing the {step} step component in isolation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Debug Info:
            </h3>
            <p className="text-xs text-gray-500">
              Current step: {step} | Check console for button click logs
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingStepTestPage;
