import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getMethod, putMethod } from '../../library/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Mail, Phone, MapPin, Globe, Pencil } from 'lucide-react';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getMethod('userprofile');
        if (response.data.status === 'success') {
          setUser(response.data.user);
        }
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
      try {
        const response = await putMethod('userprofile', data);
        if (response.data.status === 'success') {
          setUser(response.data.user);
          setIsEditing(false);
        }
      } catch (err) {
        setError('Failed to update user profile. Please try again.');
      }
    },
  });

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const UserInfoCard = () => (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profilePic || user?.avatar || 'https://github.com/shadcn.png'} />
            <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-gray-500 mb-6">User ID: {user?.id}</p>

          <div className="space-y-4 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <span>{user?.email}</span>
            </div>
          </div>

          <Button 
            onClick={() => setIsEditing(true)}
            className="mt-8 flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const EditProfileForm = () => (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePic || user?.avatar || 'https://github.com/shadcn.png'} />
                <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-gray-600" />
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                className={formik.errors.username && formik.touched.username ? 'border-red-500' : ''}
              />
              {formik.errors.username && formik.touched.username && (
                <p className="text-sm text-red-500">{formik.errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className={formik.errors.email && formik.touched.email ? 'border-red-500' : ''}
              />
              {formik.errors.email && formik.touched.email && (
                <p className="text-sm text-red-500">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                className={formik.errors.newPassword && formik.touched.newPassword ? 'border-red-500' : ''}
              />
              {formik.errors.newPassword && formik.touched.newPassword && (
                <p className="text-sm text-red-500">{formik.errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                className={formik.errors.confirmPassword && formik.touched.confirmPassword ? 'border-red-500' : ''}
              />
              {formik.errors.confirmPassword && formik.touched.confirmPassword && (
                <p className="text-sm text-red-500">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col lg:ml-64 p-6 bg-gray-50 min-h-screen">
      {isEditing ? <EditProfileForm /> : <UserInfoCard />}
    </div>
  );
};

export default UserProfilePage;
