import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Rocket, GitBranch, Server, FolderPlus, CheckCircle } from 'lucide-react';

const WelcomeStep = ({ onNext, onComplete }) => {
  const features = [
    {
      icon: GitBranch,
      title: 'GitHub Integration',
      description: 'Connect your repositories and automate deployments'
    },
    {
      icon: Server,
      title: 'Kubernetes Management',
      description: 'Deploy and manage applications on your cluster'
    },
    {
      icon: FolderPlus,
      title: 'Project Organization',
      description: 'Organize your applications into projects'
    },
    {
      icon: CheckCircle,
      title: 'Automated Workflows',
      description: 'Build, test, and deploy with automated pipelines'
    }
  ];

  const handleGetStarted = () => {
    onComplete('welcome', { started_at: new Date().toISOString() });
  };

  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="mb-6">
          <Rocket className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Opslync!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive DevOps platform for managing containerized applications 
            and Kubernetes deployments. Let's get you set up in just a few minutes.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
            <CardContent className="p-6 text-center">
              <feature.icon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What We'll Set Up */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What we'll set up together:
        </h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center bg-white px-3 py-2 rounded-full">
            <GitBranch className="h-4 w-4 text-blue-600 mr-2" />
            GitHub Connection
          </div>
          <div className="flex items-center bg-white px-3 py-2 rounded-full">
            <Server className="h-4 w-4 text-blue-600 mr-2" />
            Kubernetes Cluster
          </div>
          <div className="flex items-center bg-white px-3 py-2 rounded-full">
            <FolderPlus className="h-4 w-4 text-blue-600 mr-2" />
            Your First Project
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Let's Get Started
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          This will take about 5 minutes to complete
        </p>
      </div>
    </div>
  );
};

export default WelcomeStep; 