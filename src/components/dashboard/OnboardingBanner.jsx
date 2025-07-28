import React from 'react';
import { Alert, AlertDescription } from './ui/Alert';
import { Button } from './ui/Button';
import { Rocket, X } from 'lucide-react';

export const OnboardingBanner = ({ onStartOnboarding, onDismiss }) => {
  return (
    <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <Rocket className="h-5 w-5 text-blue-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div>
          <p className="font-semibold text-blue-900 mb-1">Welcome to Opslync! 🎉</p>
          <p className="text-blue-700">
          Congratulations! You've successfully set up your Opslync platform. You're now ready to deploy and manage your applications..
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {/* <Button
            onClick={onStartOnboarding}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
          >
            Start Setup Guide
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};