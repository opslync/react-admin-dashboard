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
  Paper,
  IconButton,
  Button,
  Modal,
  Box,
  AppBar,
  Tabs,
  Tab,
  Toolbar
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { deleteMethod, getMethod, postMethod } from "../library/api";
import GitDetailsForm from '../components/GitDetailsForm'; // Import the new component
import { githubuser } from '../library/constant';

const GitUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [gitErrorMessage, setGitErrorMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tabValue, setTabValue] = useState(0); // Default to "Git Account"
  const history = useHistory();
  const location = useLocation();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const paths = [
      '/settings/git-account',
      '/settings/container-oci-registry',
    ];
    history.push(paths[newValue]);
  };

  useEffect(() => {
    const paths = [
      '/settings/git-account',
      '/settings/container-oci-registry',
    ];
    const activeTab = paths.indexOf(location.pathname);
    setTabValue(activeTab);
  }, [location.pathname]);

  // Fetch Git user details
  const fetchGitUsers = async () => {
    try {
      const response = await getMethod('githubusers');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch Git user details. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitUsers();
  }, []);

  const handleOpenGitModal = () => {
    setIsGitModalOpen(true);
    setGitErrorMessage('');
  };

  const handleCloseGitModal = () => {
    setIsGitModalOpen(false);
  };

  const handleOpenConfirmModal = (user) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setSelectedUser(null);
    setIsConfirmModalOpen(false);
  };

  const handleSaveGitDetails = async (data) => {
    console.log('Git Details to Save:', data);
    try {
      const response = await postMethod(githubuser, data);
      console.log('Git Details Saved:', response);
      setUsers([...users, response.data]); // Add the new user to the list
      handleCloseGitModal();
      fetchGitUsers();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setGitErrorMessage('User already exists');
      } else {
        setGitErrorMessage('Failed to save Git details. Please try again.');
      }
      console.error('Failed to save Git details:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteMethod(`githubuser/delete?username=${selectedUser.username}`);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      handleCloseConfirmModal();
      fetchGitUsers();
    } catch (err) {
      setError('Failed to delete user. Please try again.');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      <AppBar position="static" color="default" className="mb-4">
        <Toolbar>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Git Account" />
            <Tab label="Container/OCI Registry" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" className="mb-6">Git Accounts</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenGitModal}
          className="mb-4"
        >
          Add Account
        </Button>
      </div>
      <Card>
        <CardContent>
          <Typography variant="h5" className="mb-4">User Details</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenConfirmModal(user)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Modal
        open={isGitModalOpen}
        onClose={handleCloseGitModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Box className="absolute top-1/4 left-1/4 w-1/2 bg-white p-4 rounded shadow-lg">
          <GitDetailsForm
            onSubmit={handleSaveGitDetails}
            onClose={handleCloseGitModal}
            errorMessage={gitErrorMessage} // Pass the error message as a prop to GitDetailsForm
          />
        </Box>
      </Modal>
      <Modal
        open={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        <Box className="absolute top-1/4 left-1/4 w-1/2 bg-white p-4 rounded shadow-lg">
          <Typography variant="h6" id="confirm-modal-title" className="mb-4">Confirm Delete</Typography>
          <Typography id="confirm-modal-description" className="mb-4">
            Are you sure you want to delete this user?
          </Typography>
          <div className="flex justify-end space-x-2">
            <Button variant="contained" color="primary" onClick={handleDeleteUser}>
              Confirm
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCloseConfirmModal}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default GitUserPage;
