import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Alert, AlertDescription } from '../../ui/alert';
import { Server, CheckCircle, AlertCircle, Cloud, Settings } from 'lucide-react';
import { postMethod } from '../../../library/api';

const ClusterSetupStep = ({ onComplete, stepData, isLoading, setError }) => {
  const [setupMethod, setSetupMethod] = useState('existing'); // existing, new
  const [clusterConfig, setClusterConfig] = useState({
    name: '',
    endpoint: '',
    token: '',
    provider: 'custom'
  });
  const [setupStatus, setSetupStatus] = useState('configuring'); // configuring, testing, connected, failed
  const [localLoading, setLocalLoading] = useState(false);

  const handleConfigChange = (field, value) => {
    setClusterConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    try {
      setLocalLoading(true);
      setSetupStatus('testing');
      
      const response = await postMethod('onboarding/cluster/setup', {
        action: 'test',
        config: clusterConfig
      });
      
      if (response.data?.success) {
        setSetupStatus('connected');
      } else {
        throw new Error(response.data?.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Cluster test failed:', error);
      setSetupStatus('failed');
      setError(error.message || 'Failed to connect to cluster. Please check your configuration.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSetupCluster = async () => {
    try {
      setLocalLoading(true);
      
      const response = await postMethod('onboarding/cluster/setup', {
        action: 'setup',
        config: clusterConfig,
        method: setupMethod
      });
      
      if (response.data?.success) {
        onComplete('cluster', {
          method: setupMethod,
          config: clusterConfig,
          cluster_id: response.data.cluster_id
        });
      } else {
        throw new Error(response.data?.error || 'Cluster setup failed');
      }
    } catch (error) {
      console.error('Cluster setup failed:', error);
      setError(error.message || 'Failed to set up cluster. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSkipCluster = () => {
    onComplete('cluster', { skipped: true, method: 'manual' });
  };

  const renderSetupContent = () => {
    switch (setupStatus) {
      case 'configuring':
        return (
          <div className="space-y-6">
            {/* Setup Method Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                How would you like to set up your Kubernetes cluster?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSetupMethod('existing')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    setupMethod === 'existing'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Server className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Existing Cluster</h4>
                  <p className="text-sm text-gray-600">
                    Connect to your existing Kubernetes cluster
                  </p>
                </button>
                
                <button
                  onClick={() => setSetupMethod('new')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    setupMethod === 'new'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Cloud className="h-6 w-6 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">New Cluster</h4>
                  <p className="text-sm text-gray-600">
                    Create a new cluster (coming soon)
                  </p>
                </button>
              </div>
            </div>

            {/* Cluster Configuration Form */}
            {setupMethod === 'existing' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clusterName">Cluster Name</Label>
                  <Input
                    id="clusterName"
                    value={clusterConfig.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    placeholder="My Kubernetes Cluster"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="endpoint">Cluster Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={clusterConfig.endpoint}
                    onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                    placeholder="https://your-cluster-endpoint.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="token">Access Token</Label>
                  <Input
                    id="token"
                    type="password"
                    value={clusterConfig.token}
                    onChange={(e) => handleConfigChange('token', e.target.value)}
                    placeholder="Your cluster access token"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleTestConnection}
                    disabled={!clusterConfig.endpoint || !clusterConfig.token || localLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    {localLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    ) : (
                      <Settings className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleSkipCluster}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            )}

            {setupMethod === 'new' && (
              <div className="text-center py-8">
                <Cloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  New Cluster Creation
                </h4>
                <p className="text-gray-600 mb-4">
                  Automated cluster creation is coming soon. For now, please use an existing cluster.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSetupMethod('existing')}
                >
                  Use Existing Cluster
                </Button>
              </div>
            )}
          </div>
        );

      case 'testing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Testing Cluster Connection
            </h3>
            <p className="text-gray-600">
              Verifying your cluster configuration...
            </p>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Cluster Connected Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your Kubernetes cluster is ready for deployments.
            </p>
            
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Cluster "{clusterConfig.name}" is now connected and ready to deploy applications.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={handleSetupCluster}
              disabled={localLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {localLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : null}
              Complete Cluster Setup
            </Button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't connect to your cluster. Please check your configuration and try again.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => setSetupStatus('configuring')}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-sm mx-auto"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipCluster}
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
            <Server className="h-6 w-6 mr-2 text-blue-600" />
            Kubernetes Cluster Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderSetupContent()}
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Why connect a cluster?</h4>
        <p className="text-sm text-gray-600">
          Your Kubernetes cluster is where your applications will be deployed and managed. 
          You can always add more clusters later from the settings page.
        </p>
      </div>
    </div>
  );
};

export default ClusterSetupStep; 