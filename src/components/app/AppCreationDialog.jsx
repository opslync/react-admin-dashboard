import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { X } from 'lucide-react';
import { postMethod, getMethod } from "../../library/api";
import { listProject } from "../../library/constant";
import { ChevronDown } from 'lucide-react';
import { useHistory } from 'react-router-dom';

export const AppCreationDialog = ({ open, onOpenChange, onAppCreated }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [repoType, setRepoType] = useState('public');
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [branches, setBranches] = useState([]);  
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [port, setPort] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [privateRepos, setPrivateRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (repoType === 'private') {
      fetchPrivateRepos();
    }
  }, [repoType]);

  const fetchProjects = async () => {
    try {
      const response = await getMethod(listProject);
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchPrivateRepos = async () => {
    try {
      const token = localStorage.getItem('github_token');
      if (!token) {
        setError('GitHub token not found. Please add your token first.');
        return;
      }

      const response = await postMethod('github/projectlist', { github_token: token });
      console.log('Repository response:', response);
      
      if (Array.isArray(response.data)) {
        setPrivateRepos(response.data);
        setError(null);
      } else {
        setPrivateRepos([]);
        setError('No repositories found');
      }
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
      setError('Failed to fetch repositories. Please check your GitHub token.');
      setPrivateRepos([]);
    }
  };

  const fetchBranches = async (username, repoName) => {
    try {
      setLoadingBranches(true);
      setError(null);
      const response = await getMethod(`app/github/branch?username=${username}&repoName=${repoName}`);
      
      if (response?.data?.status === 'success' && Array.isArray(response.data.data)) {
        const branchNames = response.data.data.map(branch => branch.name);
        
        const sortedBranches = branchNames.sort((a, b) => {
          const mainBranches = ['main', 'master'];
          if (mainBranches.includes(a) && !mainBranches.includes(b)) return -1;
          if (!mainBranches.includes(a) && mainBranches.includes(b)) return 1;
          return a.localeCompare(b);
        });

        setBranches(sortedBranches);
        
        const defaultBranch = sortedBranches.find(name => name === 'main' || name === 'master') || sortedBranches[0];
        if (defaultBranch) {
          setSelectedBranch(defaultBranch);
        }
      } else {
        setBranches([]);
        setSelectedBranch('');
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setBranches([]);
      setSelectedBranch('');
      setError('Failed to fetch branches. Please try again.');
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    if (repoType === 'public' && repoUrl) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
      if (match) {
        const [, username, repoName] = match;
        fetchBranches(username, repoName);
      }
    } else if (repoType === 'private' && selectedRepo) {
      const [username, repoName] = selectedRepo.split('/');
      fetchBranches(username, repoName);
    }
  }, [repoUrl, selectedRepo, repoType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const finalRepoUrl = repoType === 'private' 
        ? `https://github.com/${selectedRepo}.git`
        : repoUrl;

      const payload = {
        name,
        description,
        projectId: selectedProject,
        repoUrl: finalRepoUrl,
        branch: selectedBranch,
        port: parseInt(port, 10)
      };

      const response = await postMethod('app/create', payload);
      onAppCreated();
      onOpenChange(false);
      history.push(`/app/${response.data.id}/details`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Something went wrong while creating the app. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoTypeChange = async (type) => {
    setRepoType(type);
    if (type === 'private') {
      try {
        const response = await getMethod('user/github/check-app'); // Endpoint to check if GitHub app exists
        console.log('GitHub app check response:', response); // Log the response
        if (response.data.status === "success" && response.data.exists) {
          console.log('GitHub app exists. Fetching token...');
          // // Fetch GitHub token if app exists
          // const tokenResponse = await getMethod('user/github/token');
          // if (tokenResponse?.data?.status === 'success') {
          //   const token = tokenResponse.data.token;
          //   localStorage.setItem('github_token', token);
          //   console.log('GitHub token stored successfully.');
          // } else {
          //   console.error('Failed to fetch GitHub token.');
          // }
        } else {
          console.log('GitHub app does not exist. Redirecting to create app page...');
          // Redirect to GitHub app creation page
          window.location.href = '/github-app/create';
        }
      } catch (err) {
        console.error('Error checking GitHub app:', err);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-0 gap-0 shadow-lg border-0 max-h-[90vh] flex flex-col">
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
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="name">App Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter app name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter app description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="Enter port number"
                required
                min="1"
                max="65535"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <select
                id="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-950"
                required
              >
                <option value="" disabled>Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Git Repository Type</Label>
              <RadioGroup
                value={repoType}
                onValueChange={handleRepoTypeChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public Repository</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private Repository</Label>
                </div>
              </RadioGroup>
            </div>

            {repoType === 'public' ? (
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo.git"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="privateRepo">Select Repository</Label>
                <select
                  id="privateRepo"
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-950"
                  required
                >
                  <option value="" disabled>Select a repository</option>
                  {privateRepos.map((repoName, index) => (
                    <option key={index} value={repoName}>
                      {repoName}
                    </option>
                  ))}
                </select>
                {error && (
                  <div className="text-sm text-red-500 mt-1">
                    {error}
                  </div>
                )}
              </div>
            )}

            {(repoType === 'public' && repoUrl) || (repoType === 'private' && selectedRepo) ? (
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <select
                  id="branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-950"
                  required
                  disabled={loadingBranches}
                >
                  <option value="" disabled>
                    {loadingBranches ? 'Loading branches...' : 'Select a branch'}
                  </option>
                  {Array.isArray(branches) && branches.map((branchName) => (
                    <option key={branchName} value={branchName}>
                      {branchName}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {error && (
              <div className="text-sm text-red-500 mt-1">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create App'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};