import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postMethod, getMethod, deleteMethod } from "../../library/api";
import { listProject, projectCreate, listApps } from '../../library/constant';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Plus, Trash2, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";

const CreateProjectForm = ({ onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState({
    enabled: true,
    cpu: '0.5',
    memory: '256Mi',
    storage: '100Mi'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    const projectData = {
      name: name.trim(),
      description: description.trim(),
      resources: resources
    };

    try {
      await onSubmit(projectData);
      // If successful, the parent will close the modal
    } catch (err) {
      // Handle errors from the parent component
      console.error('Project creation failed:', err);
      
      // Use custom error message if available, otherwise use generic message
      let errorMessage = 'Failed to create project. Please try again.';
      
      if (err.customMessage) {
        errorMessage = err.customMessage;
      } else if (err.message && err.message !== 'Failed to create project. Please try again.') {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        const responseMessage = err.response.data.message;
        if (responseMessage.toLowerCase().includes('namespace') && 
            responseMessage.toLowerCase().includes('already exists')) {
          errorMessage = `Project name "${name}" is already taken. Please choose a different name.`;
        } else {
          errorMessage = responseMessage;
        }
      } else if (err.response?.data?.error) {
        const responseError = err.response.data.error;
        if (responseError.toLowerCase().includes('namespace') && 
            responseError.toLowerCase().includes('already exists')) {
          errorMessage = `Project name "${name}" is already taken. Please choose a different name.`;
        } else {
          errorMessage = responseError;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white p-0">
        <div className="flex justify-between items-start p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <Label>Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                className="mt-1.5"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Resource limits</Label>
                  <p className="text-sm text-gray-500">
                    With resource limits, you define the maximum cluster resources available to this project
                  </p>
                </div>
                <Switch
                  checked={resources.enabled}
                  onCheckedChange={(checked) => setResources(prev => ({...prev, enabled: checked}))}
                />
              </div>

              {resources.enabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>CPU</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={resources.cpu}
                          onChange={(e) => setResources(prev => ({...prev, cpu: e.target.value}))}
                          placeholder="0.5"
                          className="w-24 text-center"
                        />
                        <span className="text-sm text-gray-500">Cores</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Memory</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={resources.memory}
                          onChange={(e) => setResources(prev => ({...prev, memory: e.target.value}))}
                          placeholder="256Mi"
                          className="w-24 text-center"
                        />
                        <span className="text-sm text-gray-500">MB/GB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Storage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={resources.storage}
                          onChange={(e) => setResources(prev => ({...prev, storage: e.target.value}))}
                          placeholder="100Mi"
                          className="w-24 text-center"
                        />
                        <span className="text-sm text-gray-500">MB/GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="px-6 pb-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProjectListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = async () => {
    try {
      const response = await getMethod(listProject);
      setProjects(response.data.projects || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch projects. Please try again.');
      setLoading(false);
    }
  };

  const fetchApps = async () => {
    try {
      const response = await getMethod(listApps);
      setApps(response.data);
    } catch (err) {
      console.error('Failed to fetch apps:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchApps();
  }, []);

  const getProjectAppCount = (projectId) => {
    return apps.filter(app => app.projectId === projectId).length;
  };

  const handleDeleteClick = (project) => {
    const appCount = getProjectAppCount(project.id);
    if (appCount > 0) {
      setIsWarningDialogOpen(true);
    } else {
      setProjectToDelete(project);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMethod(`project/${projectToDelete.id}`);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      if (error.response?.status === 401 && error.response?.data?.message?.includes('namespace does not belong to the user')) {
        setError(error.response.data.message);
      } else {
        setError('Failed to delete project. Please try again.');
      }
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCreateProject = async (data) => {
    try {
      const response = await postMethod(projectCreate, data);
      setProjects([...projects, response]);
      setIsModalOpen(false);
      setError(''); // Clear any previous errors
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to create project. Please try again.';
      
      if (error.response) {
        const { status, data: responseData } = error.response;
        
        // Check all possible error fields and patterns
        const errorText = responseData?.message || responseData?.error || responseData?.detail || '';
        
        if (errorText) {
          const lowerErrorText = errorText.toLowerCase();
          if ((lowerErrorText.includes('namespace') && lowerErrorText.includes('already exists')) ||
              (lowerErrorText.includes('namespace') && lowerErrorText.includes('exist')) ||
              lowerErrorText.includes('already exists') ||
              lowerErrorText.includes('duplicate') ||
              lowerErrorText.includes('conflict')) {
            errorMessage = `Project name "${data.name}" is already taken. Please choose a different name.`;
          } else if (lowerErrorText.includes('namespace')) {
            errorMessage = `Namespace error: ${errorText}`;
          } else {
            errorMessage = errorText;
          }
        } else if (status === 409) {
          errorMessage = `Project name "${data.name}" already exists. Please choose a different name.`;
        } else if (status === 500) {
          errorMessage = 'Server error occurred. The project name might already be in use. Please try a different name.';
        }
      }
      
      // Create a new error object with our custom message
      const customError = new Error(errorMessage);
      customError.response = error.response;
      customError.customMessage = errorMessage;
      
      throw customError; // Re-throw with custom message
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:ml-64 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your projects and applications</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={projects.length >= 2}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="relative group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-semibold">{project.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteClick(project)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription className="text-gray-500">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {getProjectAppCount(project.id)} Applications
                </div>
                <Button variant="ghost" asChild className="text-blue-600 hover:text-blue-700">
                  <Link to={`/project/${project.id}/apps`} className="flex items-center">
                    View Apps
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectForm onSubmit={handleCreateProject} onClose={() => setIsModalOpen(false)} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-0">
          <div className="flex justify-between items-start p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">Delete Project</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="px-6 pb-6 text-base text-gray-600">
            Are you sure you want to delete this project?
            <div className="mt-2">This action cannot be undone.</div>
          </DialogDescription>
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
            >
              Delete Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog for Projects with Apps */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-0">
          <div className="flex justify-between items-start p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">Cannot Delete Project</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWarningDialogOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="px-6 pb-6 text-base text-gray-600">
            Please delete all applications associated with this project before deleting the project.
          </DialogDescription>
          <div className="flex justify-end p-4 border-t border-gray-100">
            <Button
              onClick={() => setIsWarningDialogOpen(false)}
              className="bg-[#3B82F6] hover:bg-blue-600 text-white min-w-[100px]"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectListPage;