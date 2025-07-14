import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { X } from 'lucide-react';
import { postMethod, getMethod } from "../../library/api";
import { listProject, appCreate } from "../../library/constant";
import { ChevronDown } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import githubTokenManager from '../../utils/githubTokenManager';
import { toast } from 'react-toastify';

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
  const [quota, setQuota] = useState(null);
  const [cpu, setCpu] = useState('100');
  const [memory, setMemory] = useState('128');
  const [quotaError, setQuotaError] = useState('');

  // Reset form when dialog closes
  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedProject('');
    setRepoType('public');
    setRepoUrl('');
    setSelectedRepo('');
    setBranches([]);
    setSelectedBranch('');
    setPort('');
    setError(null);
    setLoading(false);
    setQuota(null);
    setCpu('100');
    setMemory('128');
    setQuotaError('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
    window.location.reload();
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  useEffect(() => {
    if (repoType === 'private') {
      fetchPrivateRepos();
    }
  }, [repoType]);

  useEffect(() => {
    if (selectedProject) {
      // Fetch quota for selected project
      getMethod(`resource-allocation/project/${selectedProject}/quota`)
        .then((response) => {
          setQuota(response.data);
          setQuotaError('');
          // Set defaults if not already set
          setCpu('100');
          setMemory('128');
        })
        .catch((err) => {
          setQuota(null);
          setQuotaError('Failed to fetch resource quota');
        });
    } else {
      setQuota(null);
      setQuotaError('');
      setCpu('100');
      setMemory('128');
    }
  }, [selectedProject]);

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

  // Validate resource allocation
  useEffect(() => {
    if (!quota) {
      setQuotaError('');
      return;
    }
    let cpuOk = true, memOk = true;
    if (cpu && parseInt(cpu, 10) > cpuMaxMcores(quota.availableCpu)) cpuOk = false;
    if (memory && parseInt(memory, 10) > memoryMaxMB(quota.availableMemory)) memOk = false;
    if (!cpuOk || !memOk) {
      setQuotaError('Requested resources exceed available quota.');
    } else {
      setQuotaError('');
    }
  }, [cpu, memory, quota]);

  // Helper to parse memory strings like '4Gi' to Mi or MB
  function parseMemory(mem) {
    if (!mem) return 0;
    if (mem.endsWith('Gi')) return parseFloat(mem) * 1024 * 1024;
    if (mem.endsWith('Mi')) return parseFloat(mem) * 1024;
    if (mem.endsWith('MB')) return parseFloat(mem);
    return parseFloat(mem);
  }

  // Helper to get max MB from quota string
  function memoryMaxMB(mem) {
    if (!mem) return 0;
    if (mem.endsWith('Gi')) return parseInt(mem) * 1024;
    if (mem.endsWith('Mi')) return parseInt(mem);
    if (mem.endsWith('MB')) return parseInt(mem);
    return parseInt(mem);
  }

  // Helper to get max mcores from quota string (handles '500m' or '2')
  function cpuMaxMcores(cpu) {
    if (!cpu) return 0;
    if (typeof cpu === 'string' && cpu.endsWith('m')) {
      return parseInt(cpu.slice(0, -1), 10);
    }
    return Math.floor(parseFloat(cpu) * 1000);
  }

  const fetchProjects = async () => {
    try {
      const response = await getMethod(listProject);
      setProjects(response.data.projects || []);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchPrivateRepos = async () => {
    try {
      const token = localStorage.getItem('github_token');
      if (!token) {
        // Do not show any error here, handled in handleRepoTypeChange
        return;
      }
      const response = await postMethod('user/github/repo-list', { github_token: token });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (quotaError) {
      setLoading(false);
      setError(quotaError);
      return;
    }
    try {
      const finalRepoUrl = repoType === 'private' ? selectedRepo : repoUrl;
      const payload = {
        name,
        description,
        projectId: selectedProject,
        repoUrl: finalRepoUrl,
        branch: selectedBranch,
        port: parseInt(port, 10),
        cpu: cpu ? parseInt(cpu, 10) : undefined,
        memory: memory ? `${memory}MB` : undefined,
      };

      console.log('Sending payload:', payload);
      const response = await postMethod(appCreate, payload);
      
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.id:', response.data.id);
      
      // The response should have the ID in response.data.id
      const appId = response.data.id ?? response.data.ID;
      
      console.log('Extracted app ID:', appId);
      console.log('App ID type:', typeof appId);
      
      if (appId !== undefined && appId !== null) {
        console.log('App ID found, redirecting to:', `/app/${appId}/details`);
        onAppCreated();
        onOpenChange(false);
        history.push(`/app/${appId}/details`);
      } else {
        console.error('No app ID found in response. Full response data:', response.data);
        setError(`App created but no ID returned. Response data: ${JSON.stringify(response.data)}`);
      }
    } catch (err) {
      console.error('App creation error:', err);
      console.error('Error response:', err.response);

      // Prefer backend error message if available
      let errorMessage = 'Something went wrong while creating the app. Please try again.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoTypeChange = async (type) => {
    setRepoType(type);
    if (type === 'private') {
      // Check for GitHub token in localStorage
      const token = localStorage.getItem('github_token');
      if (!token) {
        // Do NOT setError here, only show toast and redirect
        toast.error('You need to connect your GitHub account to use private repositories. Redirecting to GitHub App setup...', {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          window.location.href = '/settings/git-account';
        }, 5000); // Increased delay to 5 seconds
        return;
      }
      try {
        // Wait for token to be available (with 5 second timeout)
        await githubTokenManager.waitForToken(5000);
        // Token is available, proceed with fetching repos
        await fetchPrivateRepos();
      } catch (error) {
        setError('GitHub token not available. Please complete GitHub app setup.');
        setTimeout(() => {
          window.location.href = '/settings/git-account';
        }, 2000);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white p-0 gap-0 shadow-lg border-0 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Create New App</DialogTitle>
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

            {/* Repo Type and URL/Select */}
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

            {/* Project select moved below repo selection */}
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

            {/* Resource Allocation Box - only show if project is selected */}
            {selectedProject && (
              <div className="space-y-2 border rounded-md p-4 bg-gray-50">
                <div className="font-semibold mb-2">Resource Allocation</div>
                {quota ? (
                  <div className="mb-2 text-xs text-gray-700">
                    <div>Total CPU: {cpuMaxMcores(quota.totalCpu)} mCores | Used: {cpuMaxMcores(quota.usedCpu)} mCores | Available: {cpuMaxMcores(quota.availableCpu)} mCores</div>
                    <div>Total Memory: {quota.totalMemory} | Used: {quota.usedMemory} | Available: {quota.availableMemory}</div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Loading resource quota...</div>
                )}
                <div className="flex gap-4 mt-2 items-end">
                  {/* CPU Stepper */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="font-semibold mb-1">CPU</div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="border rounded-l-md px-3 py-2 text-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setCpu(prev => Math.max(100, parseInt(prev || '100', 10) - 100).toString())}
                        disabled={!quota || parseInt(cpu || '100', 10) <= 100}
                      >
                        –
                      </button>
                      <input
                        id="cpu"
                        type="number"
                        value={cpu}
                        onChange={e => setCpu(e.target.value)}
                        className="w-20 text-center border-t border-b border-gray-300 py-2 focus:outline-none"
                        min="100"
                        max={quota ? cpuMaxMcores(quota.availableCpu) : undefined}
                        step="100"
                        disabled={!quota}
                        required
                      />
                      <button
                        type="button"
                        className="border rounded-r-md px-3 py-2 text-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setCpu(prev => {
                          const next = Math.min(
                            quota ? cpuMaxMcores(quota.availableCpu) : 4000,
                            parseInt(prev || '100', 10) + 100
                          );
                          return next.toString();
                        })}
                        disabled={!quota || (cpu && parseInt(cpu, 10) >= cpuMaxMcores(quota.availableCpu))}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">mCores</div>
                  </div>
                  {/* RAM Stepper */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="font-semibold mb-1">RAM</div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="border rounded-l-md px-3 py-2 text-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setMemory(prev => {
                          const val = parseInt(prev || '128', 10);
                          return Math.max(128, val - 128).toString();
                        })}
                        disabled={!quota || parseInt(memory || '128', 10) <= 128}
                      >
                        –
                      </button>
                      <input
                        id="memory"
                        type="number"
                        value={memory}
                        onChange={e => setMemory(e.target.value)}
                        className="w-20 text-center border-t border-b border-gray-300 py-2 focus:outline-none"
                        min="128"
                        step="128"
                        max={quota ? memoryMaxMB(quota.availableMemory) : undefined}
                        disabled={!quota}
                        required
                      />
                      <button
                        type="button"
                        className="border rounded-r-md px-3 py-2 text-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setMemory(prev => {
                          const max = quota ? memoryMaxMB(quota.availableMemory) : 65536;
                          const val = parseInt(prev || '128', 10);
                          return Math.min(max, val + 128).toString();
                        })}
                        disabled={!quota || (memory && parseInt(memory, 10) >= memoryMaxMB(quota.availableMemory))}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">MB</div>
                  </div>
                </div>
                {quotaError && (
                  <div className="text-xs text-red-500 mt-1">{quotaError}</div>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 mt-1">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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