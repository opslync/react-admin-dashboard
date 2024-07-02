import React, { useState, useEffect } from 'react';
import { useFormik, FormikProvider, Form } from 'formik';
import { TextField, Button } from '@mui/material';
import * as Yup from 'yup';
import { getMethod } from '../library/api';

const ContainerRegistryForm = ({ onSubmit, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formik = useFormik({
        initialValues: {
            registryUrl: '',
            username: '',
            token: '',
            email: '',
        },
        validationSchema: Yup.object().shape({
            registryUrl: Yup.string().required('Registry URL is required'),
            username: Yup.string().required('Username is required'),
            token: Yup.string().required('Token is required'),
            email: Yup.string().required('Email is required').email('Invalid email'),
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
