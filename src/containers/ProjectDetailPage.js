import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getMethod } from '../library/api';
import { Button, Card, CardContent, Typography } from '@mui/material';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch project details and its apps
    const fetchProjectDetails = async () => {
      try {
        const projectResponse = await getMethod(`project/${projectId}`);
        console.log("Project name: ", projectResponse.data)
        setProject(projectResponse.data);
        const appsResponse = await getMethod(`project/${projectId}/apps`);
        setApps(appsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch project details. Please try again.');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col lg:ml-64 p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6">{project ? project.name : 'Project Details'}</Typography>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <Typography variant="h5" className="mb-4">Apps in this Project</Typography>
        {apps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <Card key={app.ID} className="relative">
                <CardContent>
                  <Typography variant="h6" className="mb-2">{app.name}</Typography>
                  <Typography className="mb-4">{app.description}</Typography>
                  <Button
                    component={Link}
                    to={`/app/${app.ID}`}
                    variant="contained"
                    color="primary"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Typography>No apps found for this project.</Typography>
        )}
      </div>
      <div className="flex justify-between items-center mb-4" >
        <Button
          component={Link}
          to="/project"
          variant="contained"
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Back to Projects
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
