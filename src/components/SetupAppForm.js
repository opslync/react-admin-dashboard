import React, { useState, useEffect } from 'react';
import { listProject } from '../library/constant';
import { getMethod } from "../library/api";
import axios from 'axios';

const SetupAppForm = ({ onSubmit, onClose }) => {
  const [name, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  let isMounted = true;

  useEffect(() => {
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Fetch the list of projects
    const fetchProjects = async () => {
      try {
        const response = await getMethod(listProject);
        console.log('Projects fetched successfully:', response);
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
      await onSubmit({ name, description: appDescription, repoUrl, projectId: selectedProject });
      if (isMounted) onClose();
    } catch (err) {
      if (isMounted) setError('Failed to setup app. Please try again.');
    } finally {
      if (isMounted) setLoading(false);
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
            <label className="block text-sm font-medium mb-1">Repository URL</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
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
