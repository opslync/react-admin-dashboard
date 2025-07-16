import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import OnboardingFlow from '../../components/onboarding/OnboardingFlow';

const OnboardingTestPage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    alert('Onboarding completed successfully!');
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Test Onboarding Flow
            </h1>
            <p className="text-gray-600 mb-8">
              Click the button below to test the new 3-step onboarding process:
              <br />
              1. Organization Setup
              <br />
              2. Add Kubernetes Cluster  
              <br />
              3. Create Project
            </p>
            
            <Button
              onClick={handleStartOnboarding}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>

      <OnboardingFlow
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default OnboardingTestPage; 