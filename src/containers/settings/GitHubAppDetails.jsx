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
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_BASE_URL } from '../../library/constant';

const GitHubAppDetails = () => {
  const { appId } = useParams();
  const history = useHistory();
  const [app, setApp] = useState(null);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}user/github/apps/${appId}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setApp(result.data);
        }
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

  const handleInstallApp = () => {
    window.location.href = 'https://github.com/apps/amitoo73/installations/new';
  };

  const handleBack = () => {
    history.push('/settings/git-account');
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!app) return <Typography>App not found</Typography>;

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          className="mr-4"
        >
          Back
        </Button>
        <Typography variant="h4">GitHub App Details</Typography>
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
    </div>
  );
};

export default GitHubAppDetails; 