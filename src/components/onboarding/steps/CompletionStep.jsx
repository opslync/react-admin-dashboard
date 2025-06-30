import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { CheckCircle, ArrowRight, GitBranch, Server, FolderPlus, Rocket } from 'lucide-react';

const CompletionStep = ({ onFinish, stepData }) => {
  const completedSteps = [
    {
      icon: CheckCircle,
      title: 'Welcome',
      description: 'Started your Opslync journey',
      completed: true
    },
    {
      icon: GitBranch,
      title: 'GitHub Integration',
      description: stepData?.github?.connected ? 'Connected successfully' : 'Skipped for later setup',
      completed: true,
      status: stepData?.github?.connected ? 'success' : 'skipped'
    },
    {
      icon: Server,
      title: 'Kubernetes Cluster',
      description: stepData?.cluster?.cluster_id ? 'Cluster connected' : 'Skipped for later setup',
      completed: true,
      status: stepData?.cluster?.cluster_id ? 'success' : 'skipped'
    },
    {
      icon: FolderPlus,
      title: 'First Project',
      description: stepData?.project?.project_name 
        ? `Created "${stepData.project.project_name}"` 
        : 'Skipped for later setup',
      completed: true,
      status: stepData?.project?.project_name ? 'success' : 'skipped'
    }
  ];

  const nextSteps = [
    {
      title: 'Deploy Your First App',
      description: 'Connect a repository and deploy your application',
      action: 'Create Application',
      path: '/projects'
    },
    {
      title: 'Explore the Dashboard',
      description: 'Monitor your applications and cluster metrics',
      action: 'View Dashboard',
      path: '/overview'
    },
    {
      title: 'Configure Settings',
      description: 'Set up additional integrations and preferences',
      action: 'Open Settings',
      path: '/settings'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Success Header */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-green-100 rounded-full animate-pulse" />
          </div>
          <Rocket className="relative h-16 w-16 text-green-600 mx-auto mb-4 z-10" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Welcome to Opslync!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Congratulations! You've successfully set up your Opslync platform. 
          You're now ready to deploy and manage your applications.
        </p>
      </div>

      {/* Setup Summary */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
          Setup Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedSteps.map((step, index) => (
            <Card key={index} className={`border-2 ${
              step.status === 'success' 
                ? 'border-green-200 bg-green-50' 
                : step.status === 'skipped'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200'
            }`}>
              <CardContent className="p-4 flex items-center">
                <div className={`p-2 rounded-full mr-4 ${
                  step.status === 'success' 
                    ? 'bg-green-500' 
                    : step.status === 'skipped'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
          What's Next?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nextSteps.map((step, index) => (
            <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-gray-600 mb-4">
                  {step.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = step.path}
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Quick Tips to Get Started
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Connect More Repositories</p>
              <p className="text-sm text-gray-600">Add more GitHub repositories to deploy multiple applications</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Monitor Your Apps</p>
              <p className="text-sm text-gray-600">Use the dashboard to monitor application health and performance</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Set Up Alerts</p>
              <p className="text-sm text-gray-600">Configure notifications for deployments and system events</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Invite Team Members</p>
              <p className="text-sm text-gray-600">Collaborate with your team by inviting them to your projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
                  <Button
            onClick={() => {
              onFinish();
              // Store a flag to indicate the user completed onboarding during registration
              localStorage.setItem('onboarding-completed-during-registration', 'true');
            }}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg mb-4"
          >
            Start Using Opslync
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        <p className="text-sm text-gray-500">
          You can always access this setup guide from the help menu
        </p>
      </div>
    </div>
  );
};

export default CompletionStep; 