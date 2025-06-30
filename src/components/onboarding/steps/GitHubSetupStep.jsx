import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { GitBranch, CheckCircle, ExternalLink, AlertCircle, Github } from 'lucide-react';
import { postMethod } from '../../../library/api';
import githubTokenManager from '../../../utils/githubTokenManager';

const GitHubSetupStep = ({ onComplete, stepData, isLoading, setError }) => {
  const [setupStatus, setSetupStatus] = useState('not_started'); // not_started, setting_up, connected, failed
  const [githubData, setGithubData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    checkGitHubStatus();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      const token = await githubTokenManager.waitForToken(1000);
      if (token) {
        setSetupStatus('connected');
        setGithubData({ token, connected: true });
      }
    } catch (error) {
      setSetupStatus('not_started');
    }
  };

  const handleGitHubSetup = async () => {
    try {
      setLocalLoading(true);
      setSetupStatus('setting_up');
      
      // Start the GitHub setup process
      const response = await postMethod('onboarding/github/setup');
      
      if (response.data?.setup_url) {
        // Redirect to GitHub app installation
        window.location.href = response.data.setup_url;
      } else {
        throw new Error('No setup URL received');
      }
    } catch (error) {
      console.error('GitHub setup failed:', error);
      setSetupStatus('failed');
      setError('Failed to start GitHub setup. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSkipGitHub = () => {
    onComplete('github', { skipped: true, setup_method: 'manual' });
  };

  const handleCompleteSetup = () => {
    onComplete('github', { 
      connected: true, 
      setup_method: 'app_installation',
      github_data: githubData 
    });
  };

  const renderSetupContent = () => {
    switch (setupStatus) {
      case 'not_started':
        return (
          <div className="text-center">
            <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your GitHub Account
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your GitHub account to enable automatic deployments from your repositories.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={handleGitHubSetup}
                disabled={localLoading}
                className="bg-gray-900 hover:bg-gray-800 text-white w-full max-w-sm mx-auto flex items-center justify-center"
              >
                {localLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Github className="h-5 w-5 mr-2" />
                )}
                Connect with GitHub
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipGitHub}
                className="w-full max-w-sm mx-auto"
              >
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 'setting_up':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Setting up GitHub Connection
            </h3>
            <p className="text-gray-600">
              Redirecting you to GitHub to install the Opslync app...
            </p>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              GitHub Connected Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your GitHub account is now connected and ready to use.
            </p>
            
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                You can now deploy applications directly from your GitHub repositories.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={handleCompleteSetup}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continue to Next Step
            </Button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              GitHub Setup Failed
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't connect your GitHub account. You can try again or skip this step.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={handleGitHubSetup}
                disabled={localLoading}
                className="bg-gray-900 hover:bg-gray-800 text-white w-full max-w-sm mx-auto"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipGitHub}
                className="w-full max-w-sm mx-auto"
              >
                Skip for now
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-gray-100">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center text-2xl">
            <GitBranch className="h-6 w-6 mr-2 text-blue-600" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderSetupContent()}
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Automatic Deployments</h4>
          <p className="text-sm text-gray-600">
            Deploy your applications automatically when you push to your repository.
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Repository Access</h4>
          <p className="text-sm text-gray-600">
            Access your private repositories and manage deployments from the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubSetupStep; 