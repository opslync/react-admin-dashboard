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

  const fetchProjects = async () => {
    try {
      const response = await getMethod(listProject);
      setProjects(response.data);
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
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project. Please try again.');
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