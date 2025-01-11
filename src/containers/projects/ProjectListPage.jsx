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
  const [resourceLimitsEnabled, setResourceLimitsEnabled] = useState(false);
  const [resources, setResources] = useState({
    cpu: 2,
    ram: 1024,
    storage: 1024
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    const projectData = {
      name: name.trim(),
      description: description.trim(),
      resourceLimits: resourceLimitsEnabled ? resources : null
    };

    onSubmit(projectData);
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
                  checked={resourceLimitsEnabled}
                  onCheckedChange={setResourceLimitsEnabled}
                />
              </div>

              {resourceLimitsEnabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>CPU</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, cpu: Math.max(0.1, prev.cpu - 0.1)}))}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          value={resources.cpu}
                          onChange={(e) => setResources(prev => ({...prev, cpu: parseFloat(e.target.value)}))}
                          className="w-24 text-center"
                          step="0.1"
                          min="0.1"
                        />
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, cpu: prev.cpu + 0.1}))}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">Cores</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>RAM</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, ram: Math.max(32, prev.ram - 32)}))}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          value={resources.ram}
                          onChange={(e) => setResources(prev => ({...prev, ram: parseInt(e.target.value)}))}
                          className="w-24 text-center"
                          step="32"
                          min="32"
                        />
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, ram: prev.ram + 32}))}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">MB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Eph. Storage</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, storage: Math.max(5, prev.storage - 5)}))}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          value={resources.storage}
                          onChange={(e) => setResources(prev => ({...prev, storage: parseInt(e.target.value)}))}
                          className="w-24 text-center"
                          step="5"
                          min="5"
                        />
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, storage: prev.storage + 5}))}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Project
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