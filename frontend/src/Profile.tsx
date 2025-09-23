import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, CreditCard, Store, Edit3, Save, X, Star, Package, Eye } from 'lucide-react';
import { getSubscriptionStatus, getUserProfile, updateUserProfile, upgradeUserToSeller } from './api';

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  type: 'customer' | 'seller';
  subscribed: boolean;
  campus: string;
  profilePicture?: string;
  rating?: number;
  totalRatings?: number;
  totalProducts?: number;
  totalViews?: number;
  joinedAt: string;
  updatedAt: string;
};

type SubscriptionStatus = {
  subscribed: boolean;
  type: string;
  plan?: string;
  expiresAt?: string;
};

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    campus: '',
    profilePicture: ''
  });
  const [upgrading, setUpgrading] = useState(false);

  // Fetch user profile and subscription status
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get current user ID from localStorage or auth context
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        const [profileData, subscriptionData] = await Promise.all([
          getUserProfile(userId),
          getSubscriptionStatus()
        ]);

        setUser(profileData);
        setSubscription(subscriptionData);
        setEditForm({
          name: profileData.name,
          campus: profileData.campus,
          profilePicture: profileData.profilePicture || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling
      setEditForm({
        name: user?.name || '',
        campus: user?.campus || '',
        profilePicture: user?.profilePicture || ''
      });
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');

      if (!editForm.name.trim()) {
        setError('Name is required');
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser.id;

      const updateData = {
        name: editForm.name.trim(),
        campus: editForm.campus,
        profilePicture: editForm.profilePicture.trim() || undefined
      };

      const updatedUser = await updateUserProfile(userId, updateData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');

      // Update current user in localStorage
      const updatedCurrentUser = { ...currentUser, name: updatedUser.name };
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

      // Trigger profile update event for other components
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleUpgradeToSeller = async () => {
    try {
      setUpgrading(true);
      setError('');
      setSuccess('');

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser.id;

      const result = await upgradeUserToSeller(userId);
      
      if (result.success) {
        setUser(prev => prev ? { ...prev, type: 'seller' } : null);
        setSuccess('Successfully upgraded to seller account! You can now list products for sale.');
        
        // Update current user in localStorage
        const updatedCurrentUser = { ...currentUser, type: 'seller' };
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
        
        // Trigger profile update event
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade account');
    } finally {
      setUpgrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">User profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campus
                      </label>
                      <select
                        value={editForm.campus}
                        onChange={(e) => setEditForm(prev => ({ ...prev, campus: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Campus</option>
                        <option value="main">Main Campus</option>
                        <option value="north">North Campus</option>
                        <option value="south">South Campus</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Picture URL
                      </label>
                      <input
                        type="url"
                        value={editForm.profilePicture}
                        onChange={(e) => setEditForm(prev => ({ ...prev, profilePicture: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>Campus: {user.campus || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>Type: {user.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-gray-400" />
                        <span>Rating: {user.rating || 'No ratings yet'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>Products: {user.totalProducts || 0}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Member since {formatDate(user.joinedAt)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upgrade to Seller Card */}
            {user.type === 'customer' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Store className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Become a Seller</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Upgrade your account to start selling items on the marketplace. Sellers can list products, 
                  manage inventory, and connect with buyers.
                </p>
                <button
                  onClick={handleUpgradeToSeller}
                  disabled={upgrading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Store className="h-4 w-4" />
                  <span>{upgrading ? 'Upgrading...' : 'Upgrade to Seller'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Subscription & Stats */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
              </div>
              
              {subscription?.subscribed ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">Active Subscription</p>
                    <p className="text-green-600 text-sm">Plan: {subscription.plan || 'Premium'}</p>
                    {subscription.expiresAt && (
                      <p className="text-green-600 text-sm">
                        Expires: {formatDate(subscription.expiresAt)}
                      </p>
                    )}
                  </div>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm">
                    Manage Subscription
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 font-medium">No Active Subscription</p>
                    <p className="text-yellow-600 text-sm">Upgrade to access premium features</p>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>

            {/* Seller Stats */}
            {user.type === 'seller' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Products</span>
                    <span className="font-semibold">{user.totalProducts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold">{user.totalViews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Seller Rating</span>
                    <span className="font-semibold flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {user.rating || 'No ratings'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-gray-600 hover:bg-gray-50 rounded">
                  Change Password
                </button>
                <button className="w-full text-left p-2 text-gray-600 hover:bg-gray-50 rounded">
                  Privacy Settings
                </button>
                <button className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;