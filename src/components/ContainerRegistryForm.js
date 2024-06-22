import React, { useState, useEffect } from 'react';
import { useFormik, FormikProvider, Form } from 'formik';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import * as Yup from 'yup';
import { getMethod } from '../library/api';
import { listProject } from '../library/constant';

const ContainerRegistryForm = ({ onSubmit, onClose }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the list of projects
        const fetchProjects = async () => {
            try {
                const response = await getMethod(listProject);
                console.log('Projects fetched successfully:', response);
                setProjects(response.data);
            } catch (err) {
                console.error('Failed to fetch projects:', err);
                setError('Failed to fetch projects. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const formik = useFormik({
        initialValues: {
            registryUrl: '',
            username: '',
            token: '',
            email: '',
            projectId: '',
        },
        validationSchema: Yup.object().shape({
            registryUrl: Yup.string().required('Registry URL is required'),
            username: Yup.string().required('Username is required'),
            token: Yup.string().required('Token is required'),
            email: Yup.string().required('Email is required').email('Invalid email'),
            projectId: Yup.string().required('Project is required'),
        }),
        onSubmit: (values, { setSubmitting }) => {
            onSubmit(values);
            setSubmitting(false);
        },
    });

    return (
        <FormikProvider value={formik}>
            <Form onSubmit={formik.handleSubmit} className="flex flex-col space-y-4">
                <TextField
                    fullWidth
                    id="registryUrl"
                    name="registryUrl"
                    label="Registry URL"
                    value={formik.values.registryUrl}
                    onChange={formik.handleChange}
                    error={formik.touched.registryUrl && Boolean(formik.errors.registryUrl)}
                    helperText={formik.touched.registryUrl && formik.errors.registryUrl}
                />
                <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                />
                <TextField
                    fullWidth
                    id="token"
                    name="token"
                    label="Token"
                    value={formik.values.token}
                    onChange={formik.handleChange}
                    error={formik.touched.token && Boolean(formik.errors.token)}
                    helperText={formik.touched.token && formik.errors.token}
                />
                <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />
                <FormControl fullWidth error={formik.touched.projectId && Boolean(formik.errors.projectId)}>
                    <InputLabel>Project</InputLabel>
                    <Select
                        id="projectId"
                        name="projectId"
                        value={formik.values.projectId}
                        onChange={formik.handleChange}
                        label="Project"
                    >
                        <MenuItem value="" disabled>Select a project</MenuItem>
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                {project.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {formik.touched.projectId && formik.errors.projectId && (
                        <p className="text-red-500 text-sm">{formik.errors.projectId}</p>
                    )}
                </FormControl>
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex justify-end">
                    <Button variant="contained" className="bg-gray-500 text-white px-3 py-2 rounded mr-2" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </Form>
        </FormikProvider>
    );
};

export default ContainerRegistryForm;
