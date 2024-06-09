import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Modal, Box } from '@mui/material';
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

  useEffect(() => {
    // Fetch Git user details
    const fetchGitUsers = async () => {
      try {
        const response = await getMethod('githubuses');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch Git user details. Please try again.');
        setLoading(false);
      }
    };

    fetchGitUsers();
  }, []);

  const handleOpenGitModal = () => {
    setIsGitModalOpen(true);
  };

  const handleCloseGitModal = () => {
    setIsGitModalOpen(false);
  };

  const handleSaveGitDetails = async (data) => {
    console.log('Git Details to Save:', data);
    try {
      const response = await postMethod(githubuser, data);
      console.log('Git Details Saved:', response);
      setUsers([...users, response.data]); // Add the new user to the list
      handleCloseGitModal();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setGitErrorMessage('User already exists');
      } else {
        setGitErrorMessage('Failed to save Git details. Please try again.');
      }
      console.error('Failed to save Git details:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteMethod(`githubuses/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user. Please try again.');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="flex flex-col lg:ml-64 p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4" >
        <Typography variant="h4" className="mb-6">Git Account</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenGitModal}
          className="mb-4"
        >
          Git Connect
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
                        onClick={() => handleDeleteUser(user.id)}
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
          <Typography variant="h6" id="modal-title" className="mb-4">Add Git User</Typography>
          <GitDetailsForm onSubmit={handleSaveGitDetails} onClose={handleCloseGitModal} />
          {gitErrorMessage && <Typography color="error">{gitErrorMessage}</Typography>}
        </Box>
      </Modal>
    </div>
  );
};

export default GitUserPage;
