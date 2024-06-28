import React, { useState, useEffect, useRef } from 'react';
import { listProject } from '../library/constant';
import { getMethod } from "../library/api";
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useHistory } from 'react-router-dom';

const SetupAppForm = ({ onSubmit, onClose }) => {
  const [name, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoList, setRepoList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedGitAccount, setSelectedGitAccount] = useState('github-public');
  const [selectedRegistry, setSelectedRegistry] = useState('docker-hub');
  const [projects, setProjects] = useState([]);
  const [gitAccounts, setGitAccounts] = useState([{ id: 'github-public', username: 'GitHub Public' }]);
  const [containerRegistries, setContainerRegistries] = useState([{ id: 'docker-hub', username: 'Docker Hub' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const history = useHistory();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Fetch the list of projects
    const fetchProjects = async () => {
      try {
        const response = await getMethod(listProject);
        console.log('Projects fetched successfully:', response);
        if (isMounted.current) {
          setProjects(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };

    // Fetch the list of GitHub accounts
    const fetchGitAccounts = async () => {
      try {
        const response = await getMethod('githubusers');
        console.log('Git accounts fetched successfully:', response);
        if (isMounted.current) {
          setGitAccounts([{ id: 'github-public', username: 'GitHub Public' }, ...response.data]);
        }
      } catch (err) {
        console.error('Failed to fetch Git accounts:', err);
      }
    };

    // Fetch the list of container registries
    const fetchContainerRegistries = async () => {
      try {
        const response = await getMethod('container/account');
        console.log('Container registries fetched successfully:', response);
        if (isMounted.current) {
          setContainerRegistries([{ id: 'docker-hub', username: 'Docker Hub' }, ...response.data]);
        }
      } catch (err) {
        console.error('Failed to fetch container registries:', err);
      }
    };

    fetchProjects();
    fetchGitAccounts();
    fetchContainerRegistries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalRepoUrl = repoUrl;
    if (selectedGitAccount !== 'github-public') {
      finalRepoUrl = `https://github.com${selectedGitAccount}/${repoUrl}.git`;
    }

    try {
      await onSubmit({ name, description: appDescription, repoUrl: finalRepoUrl, projectId: selectedProject, gitAccount: selectedGitAccount, containerRegistry: selectedRegistry });
      if (isMounted.current) onClose();
    } catch (err) {
      if (isMounted.current) setError('Failed to setup app. Please try again.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleAddGitAccount = () => {
    history.push("/settings/git-account");
  };

  const handleAddContainerRegistry = () => {
    history.push("/settings/container-oci-registry");
  };

  const handleGitAccountChange = async (e) => {
    const selectedAccount = e.target.value;
    setSelectedGitAccount(selectedAccount);

    if (selectedAccount !== 'github-public') {
      try {
        const response = await getMethod('github/projectlist');
        setRepoList(response.data);
      } catch (err) {
        console.error('Failed to fetch GitHub repositories:', err);
      }
    } else {
      setRepoList([]);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl mb-4">Setup App</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">App Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">App Description</label>
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Git Account</label>
            <FormControl fullWidth>
              <Select
                value={selectedGitAccount}
                onChange={handleGitAccountChange}
                className="w-full border border-gray-300  rounded"
                required
              >
                <MenuItem value="github-public">
                  <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="w-4 h-4 inline mr-2" />
                  GitHub Public
                </MenuItem>
                {gitAccounts.map((account) => (
                  account.id !== 'github-public' && (
                    <MenuItem key={account.id} value={account.username}>
                      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="w-4 h-4 inline mr-2" />
                      {account.username}
                    </MenuItem>
                  )
                ))}
                <MenuItem value="add-git-account" onClick={handleAddGitAccount}>
                  <span className="text-blue-500 flex items-center">
                    <span className="mr-1">+</span> Add Git Account
                  </span>
                </MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Git Repo URL (use https)</label>
            {selectedGitAccount === 'github-public' ? (
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            ) : (
              <FormControl fullWidth>
                <Select
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full border border-gray-300  rounded"
                  required
                >
                  <MenuItem value="" disabled>Select a repository</MenuItem>
                  {repoList.map((repo) => (
                    <MenuItem key={repo} value={repo}>
                      {repo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Container Registry</label>
            <FormControl fullWidth>
              <Select
                value={selectedRegistry}
                onChange={(e) => setSelectedRegistry(e.target.value)}
                className="w-full border border-gray-300  rounded"
                required
              >
                <MenuItem value="docker-hub">
                  <img src="https://img.icons8.com/?size=100&id=22797&format=png&color=000000" alt="Docker Hub" className="w-4 h-4 inline mr-2" />
                  Default
                </MenuItem>
                {containerRegistries.map((registry) => (
                  registry.id !== 'docker-hub' && (
                    <MenuItem key={registry.id} value={registry.username}>
                      <img src="https://img.icons8.com/?size=100&id=22797&format=png&color=000000" alt="Docker Hub" className="w-4 h-4 inline mr-2" />
                      {registry.username}
                    </MenuItem>
                  )
                ))}
                <MenuItem value="add-container-registry" onClick={handleAddContainerRegistry}>
                  <span className="text-blue-500 flex items-center">
                    <span className="mr-1">+</span> Add Container Registry
                  </span>
                </MenuItem>
              </Select>
            </FormControl>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupAppForm;
