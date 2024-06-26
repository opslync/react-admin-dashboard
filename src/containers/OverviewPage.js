import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
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
  Paper,
  CircularProgress,
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMethod } from '../library/api';

const OverviewPage = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    // Fetch deployment history
    const fetchDeploymentHistory = async () => {
      try {
        const response = await getMethod('deployments');
        setDeployments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch deployment history. Please try again.');
        setLoading(false);
      }
    };

    fetchDeploymentHistory();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusPromises = deployments.map(async (deployment) => {
          const response = await getMethod(`pod/status?appName=${deployment.releaseName}`);
          return { releaseName: deployment.releaseName, status: response.data[0].status };
        });
        const statusResults = await Promise.all(statusPromises);
        const statusMap = statusResults.reduce((map, { releaseName, status }) => {
          map[releaseName] = status;
          return map;
        }, {});
        setStatusMap(statusMap);
      } catch (err) {
        console.error('Failed to fetch pod status:', err);
      }
    };

    if (deployments.length) {
      fetchStatus();
      const intervalId = setInterval(fetchStatus, 300000); // Fetch status every 5 minutes
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [deployments]);

  const statusCounts = deployments.reduce((acc, deployment) => {
    const status = statusMap[deployment.releaseName] || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="flex flex-col lg:ml-64 p-6 bg-gray-100 min-h-screen">
      <Typography variant="h4" className="mb-6">Deployment History</Typography>
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h5" className="mb-4">Deployment Status Chart</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h5" className="mb-4">Deployment Details</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>

                  <TableCell>App Name</TableCell>
                  <TableCell>CommitId</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deployments.map((deployment) => (
                  <TableRow key={deployment.ID}>

                    <TableCell>{deployment.releaseName}</TableCell>
                    <TableCell>{deployment.tag}</TableCell>
                    <TableCell>{moment(deployment.CreatedAt).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                    <TableCell>{deployment.username}</TableCell>
                    <TableCell>{deployment.status}</TableCell>
                    {/* <TableCell>{statusMap[deployment.releaseName] || 'Unknown'}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewPage;
