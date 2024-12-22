import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useHistory } from 'react-router-dom';
import { getMethod, postMethod } from '../../library/api';
import { listProject } from '../../library/constant';
import { X } from 'lucide-react';

export const AppCreationDialog = ({ open, onOpenChange, onAppCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedGitAccount, setSelectedGitAccount] = useState('github-public');
  const [selectedRegistry, setSelectedRegistry] = useState('docker-hub');
  const [port, setPort] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getMethod(listProject);
        setProjects(response.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };

    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await postMethod('apps', {
        name,
        description,
        repoUrl,
        projectId: selectedProject,
        gitAccount: selectedGitAccount,
        containerRegistry: selectedRegistry,
        port: parseInt(port, 10)
      });

      onAppCreated();
      onOpenChange(false);
    } catch (err) {
      setError('Failed to create app. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-0 gap-0 shadow-lg border-0">
        <div className="flex justify-between items-center p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Create New App</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              App Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 border-gray-200"
              placeholder="Enter app name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 border-gray-200"
              placeholder="Enter app description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-medium">
              Project
            </Label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
              required
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem 
                    key={project.id} 
                    value={project.id}
                    className="hover:bg-gray-100"
                  >
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl" className="text-sm font-medium">
              Repository URL
            </Label>
            <Input
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="h-10 border-gray-200"
              placeholder="https://github.com/user/repo.git"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port" className="text-sm font-medium">
              Port
            </Label>
            <Input
              id="port"
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="h-10 border-gray-200"
              placeholder="Enter port number"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-4 h-10 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
