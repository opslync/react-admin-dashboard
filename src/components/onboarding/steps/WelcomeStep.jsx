import React from 'react';
import { Button } from '../../ui/button';
import { Rocket } from 'lucide-react';

const steps = [
  {
    title: 'Organization creation',
    subtitle: 'Set up your organization details',
  },
  {
    title: 'Add Kubernetes cluster',
    subtitle: 'Connect your deployment target',
  },
  {
    title: 'Project creation',
    subtitle: 'Organize your applications and deployments',
  },
];

const WelcomeStep = ({ onComplete, onNext }) => {
  const handleGetStarted = () => {
    onComplete('welcome', { started_at: new Date().toISOString() });
    if (onNext) onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Rocket icon in rounded square */}
      <div className="bg-gray-900 rounded-2xl w-16 h-16 flex items-center justify-center mb-3">
        <Rocket className="h-10 w-10 text-white" />
      </div>
      {/* Title and subtitle */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
        Welcome to OpsLync <span role="img" aria-label="rocket">🚀</span>
      </h1>
      <p className="text-md text-gray-500 mb-8 text-center">
        Let's get your platform ready in a few quick steps.
      </p>
      {/* Steps card */}
      <div className="bg-white rounded-xl shadow border p-8 mb-10 w-full max-w-xl">
        <h2 className="text-xl font-semibold text-center mb-6">What we'll set up together:</h2>
        <ol className="space-y-6">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-400">
                  {idx + 1}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{step.title}</div>
                <div className="text-gray-500 text-sm">{step.subtitle}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {/* CTA */}
      <Button
        onClick={handleGetStarted}
        size="lg"
        className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg rounded-xl"
      >
        Get Started
      </Button>
      <p className="text-sm text-gray-400 mt-4 text-center">
        Takes about 2-3 minutes to complete
      </p>
    </div>
  );
};

export default WelcomeStep; 