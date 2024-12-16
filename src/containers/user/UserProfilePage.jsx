import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { classNames } from 'primereact/utils';
import axios from 'axios';
import { getMethod, putMethod } from '../../library/api';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    // Fetch user profile details from the API
    const fetchUserProfile = async () => {
      try {
        const response = await getMethod('userprofile');
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user profile. Please try again.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const UserProfileSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .when('newPassword', {
        is: (val) => val && val.length > 0,
        then: Yup.string().required('Confirm password is required'),
      }),
  });

  const formik = useFormik({
    initialValues: {
      username: user ? user.username : '',
      email: user ? user.email : '',
      newPassword: '',
      confirmPassword: '',
    },
    enableReinitialize: true,
    validationSchema: UserProfileSchema,
    onSubmit: async (data) => {
      console.log(data);
      try {
        const response = await putMethod('userprofile', data);
        setUser(response.data);
      } catch (err) {
        setError('Failed to update user profile. Please try again.');
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit } = formik;

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">User Profile</h2>
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src={profilePic || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleProfilePicChange}
            />
          </div>
        </div>
        <FormikProvider value={formik}>
          <Form onSubmit={handleSubmit} className="p-fluid space-y-4">
            <div className="p-field">
              <span className="p-float-label">
                <InputText
                  id="username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  className={classNames({ 'p-invalid': Boolean(touched.username && errors.username) })}
                />
                <label htmlFor="username" className={classNames({ 'p-error': Boolean(touched.username && errors.username) })}>
                  Username*
                </label>
              </span>
              {Boolean(touched.username && errors.username) && (
                <small className="p-error">{formik.errors.username}</small>
              )}
            </div>

            <div className="p-field">
              <span className="p-float-label">
                <InputText
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className={classNames({ 'p-invalid': Boolean(touched.email && errors.email) })}
                />
                <label htmlFor="email" className={classNames({ 'p-error': Boolean(touched.email && errors.email) })}>
                  Email*
                </label>
              </span>
              {Boolean(touched.email && errors.email) && (
                <small className="p-error">{formik.errors.email}</small>
              )}
            </div>

            <div className="p-field">
              <span className="p-float-label">
                <Password
                  id="newPassword"
                  name="newPassword"
                  toggleMask
                  feedback={false}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  className={classNames({ 'p-invalid': Boolean(touched.newPassword && errors.newPassword) })}
                />
                <label htmlFor="newPassword" className={classNames({ 'p-error': Boolean(touched.newPassword && errors.newPassword) })}>
                  New Password
                </label>
              </span>
              {Boolean(touched.newPassword && errors.newPassword) && (
                <small className="p-error">{formik.errors.newPassword}</small>
              )}
            </div>

            <div className="p-field">
              <span className="p-float-label">
                <Password
                  id="confirmPassword"
                  name="confirmPassword"
                  toggleMask
                  feedback={false}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  className={classNames({ 'p-invalid': Boolean(touched.confirmPassword && errors.confirmPassword) })}
                />
                <label htmlFor="confirmPassword" className={classNames({ 'p-error': Boolean(touched.confirmPassword && errors.confirmPassword) })}>
                  Confirm Password
                </label>
              </span>
              {Boolean(touched.confirmPassword && errors.confirmPassword) && (
                <small className="p-error">{formik.errors.confirmPassword}</small>
              )}
            </div>

            <div className="submitBtnBox text-center">
              <Button
                type="submit"
                label="Update"
                iconPos="right"
                loading={isSubmitting}
                className="mt-4 submitBtn"
                color="primary"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        </FormikProvider>
      </div>
    </div>
  );
};

export default UserProfilePage;
