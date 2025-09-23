import React, { useState, useEffect } from "react";
import { getSubscriptionStatus, getUserProfile, updateUserProfile, upgradeUserToSeller } from './api'; 
import { User, ArrowLeft } from 'lucide-react';

type User = {
  id: number;
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
    name: '',
    campus: ''
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user profile on component mount or when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchSubscriptionStatus();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      const profile = await getUserProfile(currentUser.id);
      setUser(profile);
      setFormData({
        name: profile.name,
        campus: profile.campus
      });
    } catch (error) {
      let errorMessage = 'Failed to load profile. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        campus: user?.campus || ''
      });
    }
    setError('');
    setSuccessMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !user) return;

    setLoading(true);
    setError('');

    try {
      const updatedProfile = await updateUserProfile(currentUser.id, formData);
      setUser(updatedProfile);
      setEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      setError(errorMessage);
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
      <div className="user-profile">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="user-profile">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
        
        <h2>User Profile</h2>
    
      </div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {user && (
        <div className="profile-content">
          <div className="profile-info">
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Account Type:</label>
              <span className={`type-badge ${user.type}`}>
                {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <label>Subscription Status:</label>
              <span className={user.subscribed ? 'subscribed' : 'not-subscribed'}>
                {user.subscribed ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="campus">Campus:</label>
                <select
                  id="campus"
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Campus</option>
                  <option value="campus-a">Campus A</option>
                  <option value="campus-b">Campus B</option>
                  <option value="campus-c">Campus C</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleEditToggle}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="info-item">
                <label>Name:</label>
                <span>{user.name}</span>
              </div>
              <div className="info-item">
                <label>Campus:</label>
                <span>{user.campus}</span>
              </div>
              <div className="profile-actions">
                <button onClick={handleEditToggle} className="edit-btn">
                  Edit Profile
                </button>
                {user.type === 'customer' && (
                  <button 
                    onClick={handleUpgradeToSeller} 
                    disabled={upgrading}
                    className="upgrade-btn"
                  >
                    {upgrading ? 'Upgrading...' : 'Upgrade to Seller'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;