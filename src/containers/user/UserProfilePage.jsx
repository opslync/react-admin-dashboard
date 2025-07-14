import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  User, 
  Mail, 
  Edit3, 
  Shield, 
  Calendar, 
  MapPin, 
  Phone, 
  Building2,
  Settings,
  Key,
  Bell,
  Globe
} from 'lucide-react';
import { getMethod, postMethod } from '../../library/api';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profileStats, setProfileStats] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await getMethod('userprofile');
        const data = response.data.data;
        setUser(data.user);
        setProfileStats(data.profileStats || []);
        setEditForm({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          location: data.user.location
        });
        setError(null);
      } catch (err) {
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setUser(prev => ({
        ...prev,
        ...editForm
      }));
    } else {
      // Start editing
      setEditForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePasswordInput = (field, value) => {
    setChangePasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError('New password and confirm password do not match.');
      setChangePasswordLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await postMethod('auth/change-password', {
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword,
      });
      if (response.data.success) {
        setChangePasswordSuccess('Password changed successfully!');
        setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      let errorMsg = 'Unable to change password. Please check your current password and try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.message && !err.message.startsWith('Request failed with status code')) {
        errorMsg = err.message;
      }
      setChangePasswordError(errorMsg);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const statIconMap = {
    Projects: Building2,
    Deployments: Settings,
    "Active Apps": Globe,
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="relative mb-6">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="space-y-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 text-center focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    )}
                    
                    <p className="text-gray-600">User ID: {user.id}</p>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span>{user.email}</span>
                      )}
                    </div>
                  </div>

                  {/* <Button
                    onClick={handleEditToggle}
                    className={`mt-6 ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Save Profile' : 'Edit Profile'}
                  </Button> */}
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="font-medium text-gray-900">{user.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Organization</p>
                        <p className="font-medium text-gray-900">{user.organization}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium text-gray-900">{user.joinDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{user.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{user.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-600">Timezone</p>
                        <p className="font-medium text-gray-900">{user.timezone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
                <div className="space-y-4">
                  {profileStats.map((stat, index) => {
                    const Icon = statIconMap[stat.label];
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className="w-5 h-5 text-blue-500" />}
                          <span className="text-gray-600">{stat.label}</span>
                        </div>
                        <span className="font-bold text-gray-900">{stat.value}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setShowChangePassword(true)}>
                    <Key className="w-4 h-4 mr-3" />
                    Change Password
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled title="Coming soon">
                    <Bell className="w-4 h-4 mr-3" />
                    Notification Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" disabled title="Coming soon">
                    <Settings className="w-4 h-4 mr-3" />
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Active</span>
                    <span className="text-sm text-gray-900">{user.lastActive}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Verification</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Verified
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowChangePassword(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={changePasswordForm.currentPassword}
                  onChange={e => handleChangePasswordInput('currentPassword', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={changePasswordForm.newPassword}
                  onChange={e => handleChangePasswordInput('newPassword', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={changePasswordForm.confirmPassword}
                  onChange={e => handleChangePasswordInput('confirmPassword', e.target.value)}
                  required
                />
              </div>
              {changePasswordError && <div className="text-red-500 text-sm">{changePasswordError}</div>}
              {changePasswordSuccess && <div className="text-green-600 text-sm">{changePasswordSuccess}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>Cancel</Button>
                <Button type="submit" disabled={changePasswordLoading}>{changePasswordLoading ? 'Changing...' : 'Change Password'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
