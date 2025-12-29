import React, { useState, useEffect } from "react";
import { getSubscriptionStatus, updateUserProfile, upgradeUserToSeller,getCurrentUser } from './api'; 
import { User, ArrowLeft, Mail, Building, CreditCard, Edit3, Save, X, Zap } from 'lucide-react';

type User = {
  id: number;
  _id?: string;
  name: string;
  email: string;
  type: string;
  subscribed: boolean;
  campus: string;
};

interface UserProfileProps {
  currentUser: User | null;
  onLogout: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onLogout, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name ||'',
    email: '',
    campus: '',

  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  

  useEffect(() => {
    if (currentUser) {
      fetchCurrentUser();
      fetchSubscriptionStatus();
    }
  }, [currentUser]);


  const fetchCurrentUser = async () => {
  try {
    const user = await getCurrentUser(); // now refers to the API version
    console.log(user);
    setUser(user);
    return user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};


    const campuses = [
    { id: 'all', name: 'All Locations' },
    { id: 'pretoria-main', name: 'Pretoria Central' },
    { id: 'soshanguve-S', name: 'Soshanguve South' },
    { id: 'soshanguve-N', name: 'Soshanguve North' },
    { id: 'ga-rankuwa', name: 'Ga-Rankuwa' },
    { id: 'pretoria-west', name: 'Pretoria Arcadia' },
    { id: 'arts', name: 'Arts' },
    { id: 'emalahleni', name: 'eMalahleni' },
    { id: 'mbombela', name: 'Mbombela' },
    { id: 'polokwane', name: 'Polokwane' }
  ];

  const fetchSubscriptionStatus = async () => {
    if (!currentUser) return;

    try {
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status.type || 'customer');
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      setSubscriptionStatus('customer');
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      // Reset form data when canceling edit
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        campus: user?.campus || '',
      });
    }
    setError('');
    setSuccessMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentUser) return;

  // Use _id from MongoDB
  const userId = currentUser._id;
  
  if (!userId) {
    setError('User ID not found. Please log in again.');
    return;
  }

  console.log('✅ Using user ID:', userId);

  // Validation
  if (!formData.email?.includes('@')) {
    setError('Please enter a valid email address');
    return;
  }

  if (!formData.name?.trim()) {
    setError('Name is required');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const updatedProfile = await updateUserProfile(userId, {
      name: formData.name.trim(),
      campus: formData.campus,
      email: formData.email.toLowerCase().trim()
    });
    
    setUser(updatedProfile);
    setEditing(false);
    setSuccessMessage('Profile updated successfully!');
    
    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (error) {
    console.error('Update error details:', error);
    setError(error instanceof Error ? error.message : 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};



  const handleUpgradeToSeller = async () => {
    if (!currentUser) return;

    setUpgrading(true);
    setError('');

    try {
      const result = await upgradeUserToSeller(currentUser.id);
      setUser(prev => prev ? { ...prev, type: 'seller' } : null);
      setSubscriptionStatus('seller');
      setSuccessMessage('Account upgraded to seller successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      let errorMessage = 'Failed to upgrade account. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      setError(errorMessage);
    } finally {
      setUpgrading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Please log in to view your profile.</p>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Save className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !user && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Profile Content */}
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Account Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <button 
                    onClick={handleEditToggle}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>

                {editing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={ user.name || formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <select
                            id="campus"
                            name="campus"
                            value={ formData.campus}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            >
                            <option value="">{campuses[0].name}</option>
                            {campuses.map((campus) => (
                                <option key={campus.id} value={campus.id}>
                                {campus.name}
                                </option>
                            ))}
                            </select>

                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={handleEditToggle}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Campus</p>
                          <p className="font-medium text-gray-900">{user.campus || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Account Type</p>
                          <p className="font-medium text-gray-900 capitalize">{user.type}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Actions & Status */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subscription</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.subscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscribed ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">User Type</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.type === 'seller' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upgrade to Seller */}
              {user.type === 'customer' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Become a Seller</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Upgrade your account to start selling products on our marketplace.
                  </p>
                  <button 
                    onClick={handleUpgradeToSeller} 
                    disabled={upgrading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>{upgrading ? 'Upgrading...' : 'Upgrade to Seller'}</span>
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;