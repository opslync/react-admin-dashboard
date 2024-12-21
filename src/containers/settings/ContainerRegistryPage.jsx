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
    Modal
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { deleteMethod, getMethod, postMethod } from "../../library/api";
import ContainerRegistryForm from '../../components/ContainerRegistryForm';
import { containerRegistry } from '../../library/constant';

const ContainerRegistryPage = () => {
    const [registries, setRegistries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
    const [registryErrorMessage, setRegistryErrorMessage] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedRegistry, setSelectedRegistry] = useState(null);
    const [tabValue, setTabValue] = useState(1); // Default to "Container/OCI Registry"
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
        if (activeTab !== -1) {
            setTabValue(activeTab);
        }
    }, [location.pathname]);

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

    useEffect(() => {
        fetchRegistries();
    }, []);

    const handleOpenRegistryModal = () => {
        setIsRegistryModalOpen(true);
        setRegistryErrorMessage('');
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
        try {
            const response = await postMethod(containerRegistry, data);
            setRegistries([...registries, response.data]);
            handleCloseRegistryModal();
            fetchRegistries();
        } catch (error) {
            if (error.response?.status === 400) {
                setRegistryErrorMessage('Registry already exists');
            } else {
                setRegistryErrorMessage('Failed to save registry details. Please try again.');
            }
        }
    };

    const handleDeleteRegistry = async () => {
        try {
            const { username } = selectedRegistry;
            await deleteMethod(`container/account?username=${username}`);
            setRegistries(registries.filter(registry => registry.username !== username));
            handleCloseConfirmModal();
            fetchRegistries();
        } catch (err) {
            setError('Failed to delete registry. Please try again.');
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
            <Typography variant="h4" className="mb-6">Container Registry</Typography>

            <Box sx={{ width: '100%', mb: 4 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="GitHub App" />
                    <Tab label="Container/OCI Registry" />
                </Tabs>
            </Box>

            {tabValue === 1 ? (
                <div className="space-y-6">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <Typography variant="h6" className="mb-2">Registry Management</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Manage your container registry connections
                                    </Typography>
                                </div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenRegistryModal}
                                >
                                    Add Registry
                                </Button>
                            </div>

                            <TableContainer>
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
                                                    <Button
                                                        onClick={() => handleOpenConfirmModal(registry)}
                                                        color="error"
                                                        startIcon={<FontAwesomeIcon icon={faTrash} />}
                                                    >
                                                        Delete
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
            ) : null}

            {/* Modals */}
            <Modal
                open={isRegistryModalOpen}
                onClose={handleCloseRegistryModal}
            >
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white p-6 rounded-lg shadow-xl">
                    <Typography variant="h6" className="mb-4">Add Container Registry</Typography>
                    <ContainerRegistryForm
                        onSubmit={handleSaveRegistryDetails}
                        onClose={handleCloseRegistryModal}
                        errorMessage={registryErrorMessage}
                    />
                </Box>
            </Modal>

            <Modal
                open={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
            >
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white p-6 rounded-lg shadow-xl">
                    <Typography variant="h6" className="mb-4">Confirm Delete</Typography>
                    <Typography className="mb-4">
                        Are you sure you want to delete this registry?
                    </Typography>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outlined" onClick={handleCloseConfirmModal}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="error" onClick={handleDeleteRegistry}>
                            Delete
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default ContainerRegistryPage;
