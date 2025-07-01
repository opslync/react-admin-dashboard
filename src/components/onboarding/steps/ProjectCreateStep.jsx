import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { FolderPlus, Info, Settings } from 'lucide-react';
import { getMethod, postMethod } from '../../../library/api';

const ProjectCreateStep = ({ onComplete, stepData, isLoading, error, setError }) => {
  const [formData, setFormData] = useState({
    name: stepData.name || '',
    description: stepData.description || '',
    clusterId: stepData.clusterId || '',
    resources: stepData.resources || {
      enabled: true,
      cpu: '0.5',
      memory: '256Mi',
      storage: '100Mi'
    }
  });
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [loadingClusters, setLoadingClusters] = useState(true);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      setLoadingClusters(true);
      const response = await getMethod('clusters');
      setClusters(Array.isArray(response.data) ? response.data : []);
      
      // Auto-select first cluster if only one exists
      if (Array.isArray(response.data) && response.data.length === 1) {
        setFormData(prev => ({
          ...prev,
          clusterId: response.data[0].id
        }));
      }
    } catch (error) {
      console.error('Failed to fetch clusters:', error);
      setError('Failed to load clusters. Please refresh and try again.');
    } finally {
      setLoadingClusters(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('resources.')) {
      const resourceField = field.replace('resources.', '');
      setFormData(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          [resourceField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    if (!formData.clusterId) {
      setError('Please select a target cluster');
      return;
    }

    try {
      setLoading(true);
      
      // Create project
      const response = await postMethod('projects', {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        cluster_id: formData.clusterId,
        resources: formData.resources.enabled ? {
          cpu: formData.resources.cpu,
          memory: formData.resources.memory,
          storage: formData.resources.storage
        } : null
      });

      // Complete this step and finish onboarding
      onComplete('project', {
        ...formData,
        projectId: response.data.id
      });
      
    } catch (error) {
      console.error('Failed to create project:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to create project. Please try again.';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        const errorText = responseData.message || responseData.error || responseData.detail || '';
        
        if (errorText) {
          const lowerErrorText = errorText.toLowerCase();
          if ((lowerErrorText.includes('project') && lowerErrorText.includes('already exists')) ||
              lowerErrorText.includes('duplicate') ||
              lowerErrorText.includes('conflict')) {
            errorMessage = `Project name "${formData.name}" is already taken. Please choose a different name.`;
          } else {
            errorMessage = errorText;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4">
          <FolderPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create Project
        </h2>
        <p className="text-lg text-gray-600">
          Set up your first project to organize your applications
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-base font-medium text-gray-700">
                  Project Name <span className="text-red-500">*</span>
                  <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="projectName"
                  type="text"
                  placeholder="my-web-app"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 text-base bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                  disabled={loading || isLoading}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-base font-medium text-gray-700">
                  Description <span className="text-gray-400">(Optional)</span>
                  <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                </Label>
                <textarea
                  id="projectDescription"
                  placeholder="Brief description of your project"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                  disabled={loading || isLoading}
                />
              </div>

              {/* Target Cluster */}
              <div className="space-y-2">
                <Label htmlFor="targetCluster" className="text-base font-medium text-gray-700">
                  Target Cluster <span className="text-red-500">*</span>
                  <Info className="inline h-4 w-4 ml-1 text-gray-400" />
                </Label>
                <Select
                  value={formData.clusterId}
                  onValueChange={(value) => handleInputChange('clusterId', value)}
                  disabled={loading || isLoading || loadingClusters}
                >
                  <SelectTrigger className="h-12 text-base bg-gray-50 border-gray-300 rounded-lg">
                    <SelectValue placeholder="Select a cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingClusters ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">Loading clusters...</div>
                    ) : clusters.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">No clusters available</div>
                    ) : (
                      Array.isArray(clusters) && clusters.map((cluster) => (
                        <SelectItem key={cluster.id} value={cluster.id}>
                          {cluster.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-namespace info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Auto-namespace creation
                    </h4>
                    <p className="text-sm text-gray-600">
                      A dedicated namespace will be automatically created for this project in the selected cluster. 
                      The namespace will be named after your project.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resource Quota Section */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium">Resource Limits</Label>
                  <Switch
                    checked={formData.resources.enabled}
                    onCheckedChange={(checked) => handleInputChange('resources.enabled', checked)}
                  />
                </div>
                {formData.resources.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-8">
                    <div>
                      <Label htmlFor="cpu" className="text-sm font-medium">
                        CPU Limit
                      </Label>
                      <Input
                        id="cpu"
                        value={formData.resources.cpu}
                        onChange={(e) => handleInputChange('resources.cpu', e.target.value)}
                        placeholder="0.5"
                        className="mt-1 bg-gray-50 border-gray-300 rounded-lg placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cores (e.g., 0.5, 1, 2)</p>
                    </div>
                    <div>
                      <Label htmlFor="memory" className="text-sm font-medium">
                        Memory Limit
                      </Label>
                      <Input
                        id="memory"
                        value={formData.resources.memory}
                        onChange={(e) => handleInputChange('resources.memory', e.target.value)}
                        placeholder="256Mi"
                        className="mt-1 bg-gray-50 border-gray-300 rounded-lg placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">MB/GB (e.g., 256Mi, 1Gi)</p>
                    </div>
                    <div>
                      <Label htmlFor="storage" className="text-sm font-medium">
                        Storage Limit
                      </Label>
                      <Input
                        id="storage"
                        value={formData.resources.storage}
                        onChange={(e) => handleInputChange('resources.storage', e.target.value)}
                        placeholder="100Mi"
                        className="mt-1 bg-gray-50 border-gray-300 rounded-lg placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">MB/GB (e.g., 100Mi, 1Gi)</p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-3">
                  {formData.resources.enabled 
                    ? 'Set resource limits to control application usage'
                    : 'Resource limits are disabled - applications can use unlimited resources'
                  }
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white text-base font-medium"
                  disabled={loading || isLoading || !formData.name.trim() || !formData.clusterId}
                >
                  {loading || isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Project...
                    </div>
                  ) : (
                    'Create Project'
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

export default ProjectCreateStep; 