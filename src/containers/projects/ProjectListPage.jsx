import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postMethod, getMethod, deleteMethod } from "../../library/api";
import { listProject, projectCreate, listApps } from '../../library/constant';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Plus, Trash2, ArrowRight, AlertCircle, X } from 'lucide-react';
import CreateProjectForm from '../../components/CreateProjectForm';

const ProjectListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [availableResources, setAvailableResources] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    setDeleteLoading(true);
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
    } finally {
      setDeleteLoading(false);
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

  // Fetch onboarding status and available resources when opening the modal
  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      // Fetch onboarding status
      const onboardingRes = await getMethod('onboarding/status');
      const onboardingData = onboardingRes.data?.data || {};
      // Extract organizationId
      let orgId = null;
      if (onboardingData.organization && onboardingData.organization.id) {
        orgId = onboardingData.organization.id;
      } else if (onboardingData.cluster && onboardingData.cluster.organizationId) {
        orgId = onboardingData.cluster.organizationId;
      }
      setOrganizationId(orgId);
      // Extract clusters (support single or array)
      let clustersArr = [];
      if (Array.isArray(onboardingData.clusters)) {
        clustersArr = onboardingData.clusters;
      } else if (onboardingData.cluster && onboardingData.cluster.id) {
        clustersArr = [onboardingData.cluster];
      }
      setClusters(clustersArr);
      // Fetch available resources for the first cluster (if any)
      if (clustersArr.length > 0) {
        const res = await getMethod('cluster/available-resources');
        setAvailableResources(res.data.availableResources);
      } else {
        setAvailableResources(null);
      }
    } catch (err) {
      setAvailableResources(null);
      setOrganizationId(null);
      setClusters([]);
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
    <div className="flex flex-col p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your projects and applications</p>
        </div>
        <Button
          onClick={handleOpenModal}
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
        <CreateProjectForm
          onSubmit={handleCreateProject}
          onClose={() => setIsModalOpen(false)}
          availableResources={availableResources}
          organizationId={organizationId}
          clusters={clusters}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-0">
          <div className="flex justify-between items-start p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">Delete Project</DialogTitle>
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
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog for Projects with Apps */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-0">
          <div className="flex justify-between items-start p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">Cannot Delete Project</DialogTitle>
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