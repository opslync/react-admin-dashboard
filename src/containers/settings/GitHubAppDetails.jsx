import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { API_BASE_URL } from '../../library/constant';
import { getMethod, deleteMethod } from '../../library/api';

const GitHubAppDetails = () => {
  const { appId } = useParams();
  const history = useHistory();
  const [app, setApp] = useState(null);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmAppName, setConfirmAppName] = useState('');
  const [token, setToken] = useState(localStorage.getItem('github_token') || '');
  const [showToken, setShowToken] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  

  const fetchAppDetails = async () => {
    try {
      const response = await getMethod(`user/github/apps/${appId}`);
      
      if (response.data.success && response.data.data) {
        setApp(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching app details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppDetails();
  }, [appId]);

  // Add auto token refresh mechanism
  useEffect(() => {
    let tokenRefreshInterval;

    const autoRefreshToken = async () => {
      if (app?.installation_id) {
        await handleGenerateToken();
      }
    };

    if (app?.installation_id) {
      // Initial token generation
      autoRefreshToken();
      
      // Set up interval for every 10 minutes (600000 milliseconds)
      tokenRefreshInterval = setInterval(autoRefreshToken, 600000);
    }

    // Cleanup interval on component unmount or when installation_id changes
    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [app?.installation_id]); // Depend on installation_id to restart interval if it changes

  const handleInstallApp = () => {
    if (app && app.name) {
      const returnUrl = `${window.location.origin}/settings/git-account`;
      window.location.href = `https://github.com/apps/${app.name}/installations/new?state=${encodeURIComponent(returnUrl)}`;
    }
  };

  const handleBack = () => {
    history.push('/settings/git-account');
  };

  const handleDeleteApp = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteMethod(`user/github/app/${appId}`);

      if (response.ok) {
        history.push('/settings/git-account');
      } else {
        console.error('Failed to delete app');
      }
    } catch (error) {
      console.error('Error deleting app:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setConfirmAppName('');
  };

  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    try {
      const response = await getMethod(`user/github/token?app_id=${appId}`);
      
      if (response.data) {
        setToken(response.data.token);
        localStorage.setItem('github_token', response.data.token);
      }
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
  };

  const handleToggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!app) return <Typography>App not found</Typography>;

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            className="mr-4"
          >
            Back
          </Button>
          <Typography variant="h4">GitHub App Details</Typography>
        </div>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete App
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">App Information</Typography>
            <div className="space-y-4">
              <div>
                <Typography variant="subtitle2" color="textSecondary">App Name</Typography>
                <Typography>{app.name}</Typography>
              </div>
              {app.owner && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Owner</Typography>
                  <div className="flex items-center space-x-2">
                    {app.owner.avatar_url && (
                      <img 
                        src={app.owner.avatar_url} 
                        alt={app.owner.login}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <Typography>{app.owner.login}</Typography>
                  </div>
                </div>
              )}
              <div>
                <Typography variant="subtitle2" color="textSecondary">App ID</Typography>
                <Typography>{app.app_id}</Typography>
              </div>
              {app.description && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Typography>{app.description}</Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Installation</Typography>
              {!app.installation_id && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleInstallApp}
                  startIcon={<GitHubIcon />}
                >
                  Install App
                </Button>
              )}
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Installation ID</Typography>
              <Typography>{app.installation_id || 'Not installed'}</Typography>
            </div>
            {app.installation_id && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="subtitle2" color="textSecondary">Access Token</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleGenerateToken}
                    disabled={generatingToken}
                  >
                    {generatingToken ? 'Generating...' : 'Generate Token'}
                  </Button>
                </div>
                {token && (
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={token}
                    type={showToken ? 'text' : 'password'}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleToggleTokenVisibility}
                            edge="end"
                          >
                            {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                          <IconButton
                            onClick={handleCopyToken}
                            edge="end"
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <Typography variant="h6" className="mb-4">URLs & Configuration</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {app.html_url && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">HTML URL</Typography>
                  <Typography>
                    <a 
                      href={app.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {app.html_url}
                    </a>
                  </Typography>
                </div>
              )}
              {app.external_url && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">External URL</Typography>
                  <Typography>{app.external_url}</Typography>
                </div>
              )}
              {app.created_at && (
                <div>
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                  <Typography>
                    {new Date(app.created_at).toLocaleString()}
                  </Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Delete GitHub App "{app.name}"</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the GitHub App "{app.name}"? This action cannot be undone and will remove all associated configurations.
            <Box mt={2}>
              <Typography variant="subtitle2" color="error">
                Type the app name "{app.name}" to confirm deletion
              </Typography>
            </Box>
            <Box mt={1}>
              <input
                type="text"
                className="w-full p-2 border rounded mt-1"
                placeholder={`Type ${app.name} to confirm`}
                onChange={(e) => setConfirmAppName(e.target.value)}
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteApp}
            color="error"
            variant="contained"
            disabled={deleteLoading || confirmAppName !== app.name}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GitHubAppDetails; 