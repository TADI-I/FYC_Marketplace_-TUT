import React, { useState } from "react";
import { registerUser } from './api';

type User = {
  id: number;
  _id?: string;
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

const RegisterForm: React.FC<{ onRegisterSuccess: (user: any) => void; onShowLogin: () => void; onClose: () => void }> = ({ onRegisterSuccess, onShowLogin, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); // new field
  const [accountType, setAccountType] = useState<'buyer' | 'seller'>('buyer');

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

  const handleRegister = async () => {
    if (!name || !email || !password || !campus) {
      alert('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      console.log('📝 Attempting registration for:', email);
      
      const response = await registerUser({
        name,
        email,
        password,
        campus,
        whatsapp,
        type: accountType // send buyer or seller to backend
      });

      console.log('✅ Registration successful:', response.user.name);
      
      onRegisterSuccess(response.user);
      setName('');
      setEmail('');
      setPassword('');
      setCampus('');
      setWhatsapp('');
      
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
      alert(errorMessage);
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
        
        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded mb-4"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded mb-4"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          
          <input 
            type="password" 
            placeholder="Password (min 8 characters)"
            className="w-full p-3 border rounded mb-1"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
          
          <input 
            type="password" 
            placeholder="Confirm Password"
            className={`w-full p-3 border rounded mb-1 ${
              password && password !== password 
                ? 'border-red-500' 
                : password === password 
                  ? 'border-green-500' 
                  : ''
            }`}
            onChange={e => setPassword(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
          
          {/* Account type selector */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <div className="flex items-center gap-4">
              <label className={`inline-flex items-center cursor-pointer px-3 py-2 border rounded ${accountType === 'buyer' ? 'bg-gray-100 border-gray-300' : 'bg-white'}`}>
                <input
                  type="radio"
                  name="accountType"
                  value="buyer"
                  checked={accountType === 'buyer'}
                  onChange={() => setAccountType('buyer')}
                  className="mr-2"
                />
                Buyer
              </label>
              <label className={`inline-flex items-center cursor-pointer px-3 py-2 border rounded ${accountType === 'seller' ? 'bg-gray-100 border-gray-300' : 'bg-white'}`}>
                <input
                  type="radio"
                  name="accountType"
                  value="seller"
                  checked={accountType === 'seller'}
                  onChange={() => setAccountType('seller')}
                  className="mr-2"
                />
                Seller
              </label>
            </div>
            {accountType === 'seller' && (
              <p className="text-xs text-gray-500 mt-1">
                As a seller, you can list items for sale. Please ensure your details are accurate.
              </p>
            )}
          </div>
          
          <select 
            className="w-full p-3 border rounded mb-4"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
          >
            <option value="">Select Your Location</option>
            {campuses.slice(1).map(campus => (
              <option key={campus.id} value={campus.id}>{campus.name}</option>
            ))}
          </select>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp (include country code)</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+27123456789"
              className="w-full p-3 border rounded mb-4"
            />
            <p className="text-xs text-gray-500 mt-1">Provide a WhatsApp number for buyers to contact you (include country code, e.g. +27...)</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 bg-orange-600 text-white p-3 rounded hover:bg-orange-700"
            >
              Register
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 bg-gray-300 p-3 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
          
          <p className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              className="text-blue-600 hover:underline"
              onClick={handleSwitchToLogin}
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;