import React, { useState } from "react";
import { registerUser } from './api';

type User = {
  id: number;
  name: string;
  email: string;
  type: string;
  subscribed: boolean;
  campus: string;
};

interface RegisterFormProps {
  onRegisterSuccess: (user: User) => void;
  onShowLogin: () => void;
  onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onShowLogin, onClose }) => {
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    userType: '', 
    campus: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const campuses = [
    { id: 'all', name: 'All Locations' },
    { id: 'pretoria-main', name: 'Pretoria Central' },
    { id: 'soshanguve', name: 'Soshanguve' },
    { id: 'ga-rankuwa', name: 'Ga-Rankuwa' },
    { id: 'pretoria-west', name: 'Pretoria Arcadia' },
    { id: 'arts', name: 'Arts' },
    { id: 'emalahleni', name: 'eMalahleni' },
    { id: 'mbombela', name: 'Mbombela' },
    { id: 'polokwane', name: 'Polokwane' }
  ];

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password || 
        !registerData.userType || !registerData.campus) {
      setError('Please fill in all fields');
      return;
    }

    if (registerData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Attempting registration for:', registerData.email);
      
      const response = await registerUser({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        userType: registerData.userType,
        campus: registerData.campus
      });

      console.log('✅ Registration successful:', response.user.name);
      
      onRegisterSuccess(response.user);
      setRegisterData({ name: '', email: '', password: '', userType: '', campus: '' });
      
      // Show success message
      setTimeout(() => {
        alert(`Welcome to FYC Marketplace, ${response.user.name}!`);
      }, 100);

    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      console.error('❌ Registration failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    onShowLogin();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Register for FYC Marketplace</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 border rounded mb-4"
          value={registerData.name}
          onChange={e => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
          disabled={loading}
          autoFocus
        />
        
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3 border rounded mb-4"
          value={registerData.email}
          onChange={e => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
          disabled={loading}
        />
        
        <input 
          type="password" 
          placeholder="Password (min 8 characters)"
          className="w-full p-3 border rounded mb-4"
          value={registerData.password}
          onChange={e => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
          onFocus={(e) => e.target.select()}
          disabled={loading}
        />  
        
        <select 
          className="w-full p-3 border rounded mb-4"
          value={registerData.campus}
          onChange={(e) => setRegisterData(prev => ({ ...prev, campus: e.target.value }))}
          disabled={loading}
        >
          <option value="">Select Your Campus</option>
          {campuses.slice(1).map(campus => (
            <option key={campus.id} value={campus.id}>{campus.name}</option>
          ))}
        </select>
        
        <select 
          className="w-full p-3 border rounded mb-4"
          value={registerData.userType}
          onChange={(e) => setRegisterData(prev => ({ ...prev, userType: e.target.value }))}
          disabled={loading}
        >
          <option value="">Select Account Type</option>
          <option value="customer">Customer (Free)</option>
          <option value="seller">Seller (R25/month)</option>
        </select>
        
        <div className="flex gap-2">
          <button 
            onClick={handleRegister} 
            disabled={loading}
            className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 bg-gray-300 p-3 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            className="text-blue-600 hover:underline"
            onClick={handleSwitchToLogin}
            disabled={loading}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;