import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Alert, AlertDescription } from '../../ui/alert';
import { FolderPlus, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { postMethod } from '../../../library/api';

const ProjectCreateStep = ({ onComplete, stepData, isLoading, setError }) => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    resources: {
      enabled: true,
      cpu: '0.5',
      memory: '256Mi',
      storage: '100Mi'
    }
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [creationStatus, setCreationStatus] = useState('form'); // form, creating, success, error

  const handleInputChange = (field, value) => {
    if (field.startsWith('resources.')) {
      const resourceField = field.replace('resources.', '');
      setProjectData(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          [resourceField]: value
        }
      }));
    } else {
      setProjectData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLocalLoading(true);
      setCreationStatus('creating');
      
      const response = await postMethod('onboarding/project/create', {
        name: projectData.name.trim(),
        description: projectData.description.trim(),
        resources: projectData.resources
      });
      
      if (response.data?.success) {
        setCreationStatus('success');
        // Auto-complete after a short delay to show success state
        setTimeout(() => {
          onComplete('project', {
            project_id: response.data.project_id,
            project_name: projectData.name,
            project_description: projectData.description
          });
        }, 1500);
      } else {
        throw new Error(response.data?.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Project creation failed:', error);
      setCreationStatus('error');
      
      // Handle specific error cases
      let errorMessage = 'Failed to create project. Please try again.';
      
      if (error.response?.data) {
        const responseData = error.response.data;
        const errorText = responseData.message || responseData.error || responseData.detail || '';
        
        if (errorText) {
          const lowerErrorText = errorText.toLowerCase();
          if ((lowerErrorText.includes('namespace') && lowerErrorText.includes('already exists')) ||
              lowerErrorText.includes('already exists') ||
              lowerErrorText.includes('duplicate') ||
              lowerErrorText.includes('conflict')) {
            errorMessage = `Project name "${projectData.name}" is already taken. Please choose a different name.`;
          } else if (lowerErrorText.includes('namespace')) {
            errorMessage = `Namespace error: ${errorText}`;
          } else {
            errorMessage = errorText;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSkipProject = () => {
    onComplete('project', { skipped: true });
  };

  const renderContent = () => {
    switch (creationStatus) {
      case 'form':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FolderPlus className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Your First Project
              </h3>
              <p className="text-gray-600">
                Projects help you organize your applications and manage deployments.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="projectName" className="text-base font-medium">
                  Project Name *
                </Label>
                <Input
                  id="projectName"
                  value={projectData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., my-web-app, api-service"
                  className="mt-2"
                  maxLength={50}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Choose a descriptive name for your project
                </p>
              </div>
              
              <div>
                <Label htmlFor="projectDescription" className="text-base font-medium">
                  Description (Optional)
                </Label>
                <Input
                  id="projectDescription"
                  value={projectData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your project"
                  className="mt-2"
                  maxLength={200}
                />
              </div>

              {/* Resource Configuration */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium">Resource Limits</Label>
                  <Switch
                    checked={projectData.resources.enabled}
                    onCheckedChange={(checked) => handleInputChange('resources.enabled', checked)}
                  />
                </div>
                
                {projectData.resources.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-8">
                    <div>
                      <Label htmlFor="cpu" className="text-sm font-medium">
                        CPU Limit
                      </Label>
                      <Input
                        id="cpu"
                        value={projectData.resources.cpu}
                        onChange={(e) => handleInputChange('resources.cpu', e.target.value)}
                        placeholder="0.5"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cores (e.g., 0.5, 1, 2)</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="memory" className="text-sm font-medium">
                        Memory Limit
                      </Label>
                      <Input
                        id="memory"
                        value={projectData.resources.memory}
                        onChange={(e) => handleInputChange('resources.memory', e.target.value)}
                        placeholder="256Mi"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">MB/GB (e.g., 256Mi, 1Gi)</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="storage" className="text-sm font-medium">
                        Storage Limit
                      </Label>
                      <Input
                        id="storage"
                        value={projectData.resources.storage}
                        onChange={(e) => handleInputChange('resources.storage', e.target.value)}
                        placeholder="100Mi"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">MB/GB (e.g., 100Mi, 1Gi)</p>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mt-3">
                  {projectData.resources.enabled 
                    ? 'Set resource limits to control application usage'
                    : 'Resource limits are disabled - applications can use unlimited resources'
                  }
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleCreateProject}
                disabled={!projectData.name.trim() || localLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                {localLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <FolderPlus className="h-4 w-4 mr-2" />
                )}
                Create Project
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipProject}
                className="flex-1"
              >
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 'creating':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Creating Your Project
            </h3>
            <p className="text-gray-600">
              Setting up "{projectData.name}" project...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Project Created Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your project "{projectData.name}" is ready for applications.
            </p>
            
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                You can now deploy applications to your "{projectData.name}" project.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Project Creation Failed
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't create your project. Please try again or skip this step.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => setCreationStatus('form')}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-sm mx-auto"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipProject}
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
            <FolderPlus className="h-6 w-6 mr-2 text-blue-600" />
            First Project Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderContent()}
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Organize Applications</h4>
          <p className="text-sm text-gray-600">
            Group related applications together for better management and organization.
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Resource Management</h4>
          <p className="text-sm text-gray-600">
            Set resource limits and manage deployments at the project level.
          </p>
        </div>
      </div>

      {/* Project Examples */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Project Examples:</h4>
        <div className="flex flex-wrap gap-2">
          {['E-commerce Platform', 'API Gateway', 'Data Pipeline', 'Mobile Backend'].map((example) => (
            <span
              key={example}
              className="bg-white px-3 py-1 rounded-full text-sm text-gray-600 border cursor-pointer hover:bg-blue-50 hover:border-blue-200"
              onClick={() => handleInputChange('name', example)}
            >
              {example}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreateStep; 