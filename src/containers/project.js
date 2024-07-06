import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postMethod, getMethod, deleteMethod } from "../library/api";
import CreateProjectForm from '../components/CreateProjectForm';
import ConfirmModal from '../components/ConfirmModal'; // Adjust the import path as needed
import { listProject, projectCreate, listApps } from '../library/constant';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardContent, Typography, IconButton, Tooltip, Modal, Box } from '@mui/material';

const ProjectPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAppWarningModalOpen, setIsAppWarningModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectIdToDelete, setProjectIdToDelete] = useState(null);

  // Fetch the list of projects from the API
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

  // Fetch the list of apps from the API
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateProject = async (data) => {
    console.log('Project Data to Save:', data);
    try {
      const response = await postMethod(projectCreate, data);
      setProjects([...projects, response]);
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project. Please try again.');
    }
  };

  const handleOpenConfirmModal = (projectId) => {
    const hasApps = apps.some(app => app.projectId === projectId);
    if (hasApps) {
      setIsAppWarningModalOpen(true);
    } else {
      setProjectIdToDelete(projectId);
      setIsConfirmModalOpen(true);
    }
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setProjectIdToDelete(null);
  };

  const handleCloseAppWarningModal = () => {
    setIsAppWarningModalOpen(false);
  };

  const handleDeleteProject = async () => {
    try {
      await deleteMethod(`project/${projectIdToDelete}`);
      setProjects(projects.filter(project => project.id !== projectIdToDelete)); // Remove the project from the list
      handleCloseConfirmModal();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Projects</Typography>
        <Tooltip title={projects.length >= 2 ? 'You can only create two projects.' : ''}>
          <span>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleOpenModal}
              disabled={projects.length >= 2}
            >
              Create Project
            </Button>
          </span>
        </Tooltip>
      </div>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="relative">
              <CardContent>
                <Typography variant="h6" className="mb-2">{project.name}</Typography>
                <Typography className="mb-4">{project.description}</Typography>
                <Button
                  component={Link}
                  to={`/project/${project.id}/apps`}
                  variant="contained"
                  color="primary"
                >
                  View Apps
                </Button>
                <IconButton
                  onClick={() => handleOpenConfirmModal(project.id)}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateProjectForm onSubmit={handleCreateProject} onClose={handleCloseModal} />
      )}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleDeleteProject}
        message="Are you sure you want to delete this project?"
      />
      <Modal
        open={isAppWarningModalOpen}
        onClose={handleCloseAppWarningModal}
        aria-labelledby="app-warning-modal-title"
        aria-describedby="app-warning-modal-description"
      >
        <Box className="absolute top-1/4 left-1/4 w-1/2 bg-white p-4 rounded shadow-lg">
          <Typography variant="h6" id="app-warning-modal-title" className="mb-4">Delete Project</Typography>
          <Typography id="app-warning-modal-description" className="mb-4">
            Please delete all the apps associated with this project first.
          </Typography>
          <div className="flex justify-end space-x-2">
            <Button variant="contained" color="primary" onClick={handleCloseAppWarningModal}>
              OK
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ProjectPage;
