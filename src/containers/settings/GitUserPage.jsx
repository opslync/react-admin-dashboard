import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Tabs,
  Tab,
  Modal,
  Divider,
  IconButton
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { API_BASE_URL } from '../../library/constant';
import GitHubAppRegistration from './GitHubAppRegistration';

const GitUserPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAppDetailsOpen, setIsAppDetailsOpen] = useState(false);
  const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();

  // Fetch GitHub apps
  const fetchApps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}user/github/apps`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setApps(result.data);
        } else {
          setApps([]);
          console.error('Invalid data format received');
        }
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch app details
  const fetchAppDetails = async (appId) => {
    try {
      const response = await fetch(`${API_BASE_URL}user/github/apps/${appId}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSelectedApp(result.data);
          setIsAppDetailsOpen(true);
        } else {
          console.error('Invalid app details format received');
        }
      }
    } catch (error) {
      console.error('Error fetching app details:', error);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateGitHubApp = () => {
    setIsCreateAppOpen(true);
  };

  const handleCloseCreateApp = (appId) => {
    setIsCreateAppOpen(false);
    // Refresh the apps list after creation
    fetchApps();
    // Redirect to app details if appId is provided
    if (appId) {
      history.push(`/settings/github-app/${appId}`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const paths = [
      '/settings/git-account',
      '/settings/container-oci-registry',
    ];
    history.push(paths[newValue]);
  };

  const handleViewAppDetails = (appId) => {
    history.push(`/settings/github-app/${appId}`);
  };

  const AppDetailsModal = () => (
    <Modal
      open={isAppDetailsOpen}
      onClose={() => setIsAppDetailsOpen(false)}
    >
      <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] bg-white p-6 rounded-lg shadow-xl">
        {selectedApp && (
          <>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">App Details</Typography>
              <IconButton onClick={() => setIsAppDetailsOpen(false)} size="small">
                ✕
              </IconButton>
            </div>
            <Divider className="mb-4" />
            <div className="space-y-4">
              <div>
                <Typography variant="subtitle2" color="textSecondary">App Name</Typography>
                <Typography>{selectedApp.name}</Typography>
              </div>
              {selectedApp.owner && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Owner</Typography>
                  <div className="flex items-center space-x-2">
                    {selectedApp.owner.avatar_url && (
                      <img 
                        src={selectedApp.owner.avatar_url} 
                        alt={selectedApp.owner.login}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <Typography>{selectedApp.owner.login}</Typography>
                  </div>
                </div>
              )}
              <div>
                <Typography variant="subtitle2" color="textSecondary">App ID</Typography>
                <Typography>{selectedApp.app_id}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="textSecondary">Installation ID</Typography>
                <Typography>{selectedApp.installation_id}</Typography>
              </div>
              {selectedApp.html_url && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">HTML URL</Typography>
                  <Typography>
                    <a 
                      href={selectedApp.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedApp.html_url}
                    </a>
                  </Typography>
                </div>
              )}
              {selectedApp.external_url && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">External URL</Typography>
                  <Typography>{selectedApp.external_url}</Typography>
                </div>
              )}
              {selectedApp.created_at && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                  <Typography>
                    {new Date(selectedApp.created_at).toLocaleString()}
                  </Typography>
                </div>
              )}
              {selectedApp.description && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Typography>{selectedApp.description}</Typography>
                </div>
              )}
            </div>
          </>
        )}
      </Box>
    </Modal>
  );

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6">Git Integration</Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="GitHub App" />
          <Tab label="Container/OCI Registry" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Typography variant="h6" className="mb-2">GitHub Apps</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manage your GitHub Apps and their configurations
                  </Typography>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateGitHubApp}
                    startIcon={<GitHubIcon />}
                  >
                    Create GitHub App
                  </Button>
                </div>
              </div>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>App Name</TableCell>
                      <TableCell>App ID</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apps.map((app) => (
                      <TableRow key={app.ID}>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.app_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <img 
                              src={app.owner.avatar_url} 
                              alt={app.owner.login}
                              className="w-6 h-6 rounded-full"
                            />
                            <span>{app.owner.login}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(app.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleViewAppDetails(app.app_id)}
                            color="primary"
                            startIcon={<OpenInNewIcon />}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <AppDetailsModal />

      <Modal
        open={isCreateAppOpen}
        onClose={handleCloseCreateApp}
        aria-labelledby="create-github-app-modal"
      >
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] bg-white p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Create GitHub App</Typography>
            <IconButton onClick={handleCloseCreateApp} size="small">
              ✕
            </IconButton>
          </div>
          <Divider className="mb-4" />
          <GitHubAppRegistration onSuccess={handleCloseCreateApp} />
        </Box>
      </Modal>
    </div>
  );
};

export default GitUserPage;
