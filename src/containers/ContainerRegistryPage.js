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
import ContainerRegistryForm from '../components/ContainerRegistryForm'; // Import the new component
import { containerRegistry } from '../library/constant'; // Adjust the import path as needed

const ContainerRegistryPage = () => {
    const [registries, setRegistries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
    const [registryErrorMessage, setRegistryErrorMessage] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedRegistry, setSelectedRegistry] = useState(null);
    const [tabValue, setTabValue] = useState(2); // Default to "Container/OCI Registry"
    const history = useHistory();
    const location = useLocation();

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            '/settings/git-account',
            // '/settings/host-url',
            '/settings/container-oci-registry',
        ];
        history.push(paths[newValue]);
    };

    useEffect(() => {
        const paths = [
            '/settings/git-account',
            // '/settings/host-url',
            '/settings/container-oci-registry',
        ];
        const activeTab = paths.indexOf(location.pathname);
        setTabValue(activeTab);
    }, [location.pathname]);

    useEffect(() => {
        // Fetch container registry details
        const fetchRegistries = async () => {
            try {
                const response = await getMethod('container/account');
                setRegistries(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch container registry details. Please try again.');
                setLoading(false);
            }
        };

        fetchRegistries();
    }, []);

    const handleOpenRegistryModal = () => {
        setIsRegistryModalOpen(true);
    };

    const handleCloseRegistryModal = () => {
        setIsRegistryModalOpen(false);
    };

    const handleOpenConfirmModal = (registry) => {
        setSelectedRegistry(registry);
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setSelectedRegistry(null);
        setIsConfirmModalOpen(false);
    };

    const handleSaveRegistryDetails = async (data) => {
        console.log('Registry Details to Save:', data);
        try {
            const response = await postMethod(containerRegistry, data);
            console.log('Registry Details Saved:', response);
            setRegistries([...registries, response.data]); // Add the new registry to the list
            handleCloseRegistryModal();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setRegistryErrorMessage('Registry already exists');
            } else {
                setRegistryErrorMessage('Failed to save registry details. Please try again.');
            }
            console.error('Failed to save registry details:', error);
        }
    };

    const handleDeleteRegistry = async () => {
        try {
            const { registryUrl, username } = selectedRegistry;
            const data = { username };
            await deleteMethod(`container/account?username=${username}`);
            setRegistries(registries.filter(registry => registry.registryUrl !== registryUrl));
            handleCloseConfirmModal();
        } catch (err) {
            setError('Failed to delete registry. Please try again.');
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
                        {/* <Tab label="Host URL" /> */}
                        <Tab label="Container/OCI Registry" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <div className="flex justify-between items-center mb-4">
                <Typography variant="h4" className="mb-6">Container/OCI Registry</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenRegistryModal}
                    className="mb-4"
                >
                    Add Registry
                </Button>
            </div>
            <Card>
                <CardContent>
                    <Typography variant="h5" className="mb-4">Registry Details</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Registry URL</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {registries.map((registry) => (
                                    <TableRow key={registry.registryUrl}>
                                        <TableCell>{registry.registryUrl}</TableCell>
                                        <TableCell>{registry.username}</TableCell>
                                        <TableCell>{registry.email}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleOpenConfirmModal(registry)}
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
                open={isRegistryModalOpen}
                onClose={handleCloseRegistryModal}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <Box className="absolute top-1/4 left-1/4 w-1/2 bg-white p-4 rounded shadow-lg">
                    <Typography variant="h6" id="modal-title" className="mb-4">Add Container Registry</Typography>
                    <ContainerRegistryForm onSubmit={handleSaveRegistryDetails} onClose={handleCloseRegistryModal} />
                    {registryErrorMessage && <Typography color="error">{registryErrorMessage}</Typography>}
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
                        Are you sure you want to delete this registry?
                    </Typography>
                    <div className="flex justify-end space-x-2">
                        <Button variant="contained" color="primary" onClick={handleDeleteRegistry}>
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

export default ContainerRegistryPage;
