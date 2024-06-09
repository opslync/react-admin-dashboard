import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMethod, postMethod, deleteMethod } from "../library/api";
import SetupAppForm from '../components/SetupAppForm'; // Adjust the import path as needed
import ConfirmModal from '../components/ConfirmModal';
import { appCreate, listApps } from '../library/constant';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardActions, Typography, Button, IconButton, CircularProgress, Grid, Modal, Box } from '@mui/material';

const AppPage = () => {
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [setupErrorMessage, setSetupErrorMessage] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appIdToDelete, setAppIdToDelete] = useState(null);


  // Fetch the list of apps from the API
  const fetchApps = async () => {
    try {
      const response = await getMethod(listApps);
      const mappedApps = response.data.map(app => ({
        id: app.ID,
        name: app.name,
        description: app.description,
        repoUrl: app.repoUrl,
        projectId: app.projectId,
        createdAt: app.CreatedAt,
        updatedAt: app.UpdatedAt,
        deletedAt: app.DeletedAt
      }));
      console.log('App Setup:', response);
      setApps(mappedApps);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch apps. Please try again.');
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchApps();
  }, []);

  const handleOpenSetupModal = () => {
    setIsSetupModalOpen(true);
  };

  const handleCloseSetupModal = () => {
    setIsSetupModalOpen(false);
  };

  const handleSetupApp = async (data) => {
    console.log('App Data to Save:', data);
    try {
      const response = await postMethod(appCreate, data);
      const newApp = {
        id: response.ID,
        name: response.name,
        description: response.description,
        repoUrl: response.repoUrl,
        projectId: response.projectId,
        createdAt: response.CreatedAt,
        updatedAt: response.UpdatedAt,
        deletedAt: response.DeletedAt
      };
      setApps([...apps, newApp]);
      console.log('App Setup:', response);
      handleCloseSetupModal();
      fetchApps();
    } catch (error) {
      console.error('Failed to setup app:', error);
      setError('Failed to setup app. Please try again.');
    }
  };

  const handleOpenConfirmModal = (appId) => {
    console.log('Opening confirm modal for app ID:', appId); // Debugging step
    setAppIdToDelete(appId);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setAppIdToDelete(null);
  };

  const handleDeleteApp = async () => {
    try {
      if (appIdToDelete) {
        await deleteMethod(`app/${appIdToDelete}`);
        setApps(apps.filter(app => app.id !== appIdToDelete)); // Remove the app from the list
        handleCloseConfirmModal();
      } else {
        console.error('No app ID to delete.');
      }
    } catch (error) {
      console.error('Failed to delete app:', error);
      setError('Failed to delete app. Please try again.');
    }
  };

  return (
    <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" className="mb-4">Apps</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenSetupModal}
          className="absolute top-4 right-4"
        >
          + Setup App
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {apps.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card className="relative">
                <CardContent>
                  <Typography variant="h6" component={Link} to={`/app/${app.id}`} className="text-xl font-semibold mb-2 hover:underline">
                    {app.name}
                  </Typography>
                  <Typography>{app.description}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    onClick={() => handleOpenConfirmModal(app.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Modal
        open={isSetupModalOpen}
        onClose={handleCloseSetupModal}
        aria-labelledby="setup-app-modal-title"
        aria-describedby="setup-app-modal-description"
      >
        <Box className="absolute top-1/4 left-1/4 w-1/2 bg-white p-4 rounded shadow-lg">
          <Typography variant="h6" id="setup-app-modal-title" className="mb-4">Setup App</Typography>
          <SetupAppForm onSubmit={handleSetupApp} onClose={handleCloseSetupModal} />
          {setupErrorMessage && <Typography color="error">{setupErrorMessage}</Typography>}
        </Box>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleDeleteApp}
        message="Are you sure you want to delete this app?"
      />
    </div>
  );
};

export default AppPage;
