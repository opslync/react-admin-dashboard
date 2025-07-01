import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Server, CheckCircle, Info } from 'lucide-react';
import { postMethod } from '../../../library/api';

const ClusterSetupStep = ({ onComplete, stepData, isLoading, error, setError }) => {
  const [formData, setFormData] = useState({
    name: stepData.name || '',
    endpoint: stepData.endpoint || '',
    authMethod: stepData.authMethod || 'kubeconfig',
    bearerToken: stepData.bearerToken || '',
    kubeconfig: stepData.kubeconfig || null
  });
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'validating', 'success', 'error'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
    setValidationStatus(null);
  };

  const handleKubeconfigUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Convert the file content to base64
          const base64Content = btoa(event.target.result);
          setFormData(prev => ({ ...prev, kubeconfig: base64Content }));
        } catch (error) {
          console.error('Error encoding kubeconfig to base64:', error);
          setError('Failed to process kubeconfig file. Please try again.');
        }
      };
      reader.onerror = () => {
        setError('Failed to read kubeconfig file. Please try again.');
      };
      reader.readAsText(file);
    }
    setValidationStatus(null);
    if (error) setError('');
  };

  const handleValidateConnection = async () => {
    if (!formData.endpoint.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.authMethod === 'bearer' && !formData.bearerToken.trim()) {
      setError('Please provide a bearer token');
      return;
    }
    if (formData.authMethod === 'kubeconfig' && !formData.kubeconfig) {
      setError('Please upload a kubeconfig file');
      return;
    }
    try {
      setValidationStatus('validating');
      setError('');
      let payload = {
        name: formData.name.trim(),
        endpoint: formData.endpoint.trim(),
        auth_method: formData.authMethod,
        organization_id: stepData.organizationId
      };
      if (formData.authMethod === 'bearer') {
        payload.bearer_token = formData.bearerToken.trim();
      } else if (formData.authMethod === 'kubeconfig') {
        payload.kubeconfig = formData.kubeconfig;
      }
      const response = await postMethod('clusters/validate', payload);
      if (response.data?.success) {
        setValidationStatus('success');
      } else {
        throw new Error(response.data?.message || 'Connection validation failed');
      }
    } catch (error) {
      console.error('Cluster validation failed:', error);
      setValidationStatus('error');
      setError(error.response?.data?.message || 'Failed to validate cluster connection');
    }
  };

  const handleAddCluster = async () => {
    if (validationStatus !== 'success') {
      setError('Please validate the connection first');
      return;
    }
    try {
      setLoading(true);
      let payload = {
        name: formData.name.trim(),
        endpoint: formData.endpoint.trim(),
        auth_method: formData.authMethod,
        organization_id: stepData.organizationId
      };
      if (formData.authMethod === 'bearer') {
        payload.bearer_token = formData.bearerToken.trim();
      } else if (formData.authMethod === 'kubeconfig') {
        payload.kubeconfig = formData.kubeconfig;
      }
      const response = await postMethod('clusters', payload);
      onComplete('cluster', {
        ...formData,
        clusterId: response.data.id
      });
    } catch (error) {
      console.error('Failed to add cluster:', error);
      setError(error.response?.data?.message || 'Failed to add cluster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white">
          <CardHeader className="pb-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-2 shadow">
                <Server className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-1">Add Kubernetes Cluster</CardTitle>
              <CardDescription className="text-gray-600 text-base">Connect your cluster to deploy applications</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form className="space-y-8">
              {/* Cluster Name */}
              <div className="space-y-2">
                <Label htmlFor="clusterName" className="text-base font-medium text-gray-700">
                  Cluster Name <span className="text-red-500">*</span>
                  <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="clusterName"
                  type="text"
                  placeholder="production-cluster"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 text-base rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 placeholder:text-gray-400"
                  disabled={loading || isLoading}
                  required
                />
              </div>
              {/* Divider */}
              <div className="border-t border-gray-100 my-2" />
              {/* API Endpoint */}
              <div className="space-y-2">
                <Label htmlFor="endpoint" className="text-base font-medium text-gray-700">
                  API Endpoint <span className="text-red-500">*</span>
                  <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="endpoint"
                  type="url"
                  placeholder="https://your-cluster-api.example.com"
                  value={formData.endpoint}
                  onChange={(e) => handleInputChange('endpoint', e.target.value)}
                  className="h-12 text-base rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 placeholder:text-gray-400"
                  disabled={loading || isLoading}
                  required
                />
              </div>
              {/* Divider */}
              <div className="border-t border-gray-100 my-2" />
              {/* Authentication Method */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-700 mb-1">
                  Authentication Method
                </Label>
                <RadioGroup
                  value={formData.authMethod}
                  onValueChange={(value) => handleInputChange('authMethod', value)}
                  className="flex space-x-8"
                >
                  <label htmlFor="kubeconfig" className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${formData.authMethod === 'kubeconfig' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <RadioGroupItem value="kubeconfig" id="kubeconfig" />
                    <span className="text-base font-normal">Kubeconfig Upload</span>
                  </label>
                  <label htmlFor="bearer" className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${formData.authMethod === 'bearer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <RadioGroupItem value="bearer" id="bearer" />
                    <span className="text-base font-normal">Bearer Token</span>
                  </label>
                </RadioGroup>
              </div>
              {/* Kubeconfig Upload */}
              {formData.authMethod === 'kubeconfig' && (
                <div className="space-y-2">
                  <Label htmlFor="kubeconfigUpload" className="text-base font-medium text-gray-700">
                    Kubeconfig File <span className="text-red-500">*</span>
                    <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                  </Label>
                  <input
                    id="kubeconfigUpload"
                    type="file"
                    accept=".yaml,.yml,.txt,application/yaml,application/x-yaml,text/yaml,text/x-yaml"
                    onChange={handleKubeconfigUpload}
                    className="block w-full text-base text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={loading || isLoading}
                  />
                  {formData.kubeconfig && (
                    <div className="text-green-700 text-sm mt-1">Kubeconfig file loaded.</div>
                  )}
                </div>
              )}
              {/* Bearer Token */}
              {formData.authMethod === 'bearer' && (
                <div className="space-y-2">
                  <Label htmlFor="bearerToken" className="text-base font-medium text-gray-700">
                    Bearer Token <span className="text-red-500">*</span>
                    <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                  </Label>
                  <textarea
                    id="bearerToken"
                    placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6IlNJbIstmpZCI6Il..."
                    value={formData.bearerToken}
                    onChange={(e) => handleInputChange('bearerToken', e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono bg-gray-50 placeholder:text-gray-400"
                    disabled={loading || isLoading}
                    required
                  />
                </div>
              )}
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {/* Success Display */}
              {validationStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-700 text-sm">Connection validated successfully!</p>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleValidateConnection}
                  disabled={loading || isLoading || validationStatus === 'validating' || !formData.endpoint.trim() || (formData.authMethod === 'bearer' ? !formData.bearerToken.trim() : formData.authMethod === 'kubeconfig' ? !formData.kubeconfig : false)}
                  className="flex-1 h-12 text-base rounded-lg border-blue-600 focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {validationStatus === 'validating' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Validating...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Validate Connection
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleAddCluster}
                  disabled={loading || isLoading || validationStatus !== 'success'}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg shadow-md transition-colors"
                >
                  {loading || isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding Cluster...
                    </div>
                  ) : (
                    'Add Cluster'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClusterSetupStep; 