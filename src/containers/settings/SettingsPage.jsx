import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { useHistory } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import OnboardingFlow from '../../components/onboarding/OnboardingFlow';
import onboardingManager from '../../utils/onboardingManager';

const SettingsPage = () => {
  const history = useHistory();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const settingsOptions = [
    {
      title: 'Git Account',
      description: 'Configure your Git account settings',
      path: '/settings/git-account'
    },
    {
      title: 'Container Registry',
      description: 'Manage container registry configurations',
      path: '/settings/container-oci-registry'
    },
    {
      title: 'GitHub Integration',
      description: 'Set up GitHub application integration',
      path: '/github-source'
    }
  ];

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    onboardingManager.markCompleted();
    setShowOnboarding(false);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button
          onClick={handleStartOnboarding}
          variant="outline"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          🚀 Run Setup Guide
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsOptions.map((option, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => history.push(option.path)}
          >
            <h2 className="text-xl font-semibold mb-2">{option.title}</h2>
            <p className="text-gray-600">{option.description}</p>
          </Card>
        ))}
      </div>

      {/* Onboarding Flow */}
      <OnboardingFlow
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default SettingsPage; 