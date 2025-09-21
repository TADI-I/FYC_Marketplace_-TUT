import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Plus, Search, User, Star, DollarSign, Tag, Filter, X } from 'lucide-react';
import './App.css';

const App = () => {
  
  type User = {
    id: number;
    name: string;
    email: string;
    type: string;
    subscribed: boolean;
    campus: string;
  };
  
  type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    sellerId: number;
    sellerName: string;
    sellerCampus: string;
    image: string;
    rating: number;
    type: string;
  };
  
  type Message = {
    id: number;
    senderId: number;
    senderName: string;
    text: string;
    timestamp: string;
  };

  type MessageMap = {
    [key: string]: Message[];
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [chatWith, setChatWith] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageMap>({});
  const [newMessage, setNewMessage] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', userType: '', campus: '' });
  const [productData, setProductData] = useState({
    title: '', description: '', price: '', category: '', type: 'product'
  });

  // Sample data
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@tut.ac.za', type: 'seller', subscribed: true, campus: 'pretoria-main' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@tut.ac.za', type: 'customer', subscribed: false, campus: 'soshanguve' },
    { id: 3, name: 'Mike Johnson', email: 'mike@tut.ac.za', type: 'seller', subscribed: true, campus: 'ga-rankuwa' }
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      title: 'Engineering Textbooks Bundle',
      description: 'Complete set of engineering textbooks for first year students',
      price: 1500,
      category: 'books',
      sellerId: 1,
      sellerName: 'John Doe',
      sellerCampus: 'pretoria-main',
      image: '/api/placeholder/300/200',
      rating: 4.8,
      type: 'product'
    },
    {
      id: 2,
      title: 'Math Tutoring Services',
      description: 'One-on-one mathematics tutoring for all levels',
      price: 200,
      category: 'services',
      sellerId: 3,
      sellerName: 'Mike Johnson',
      sellerCampus: 'ga-rankuwa',
      image: '/api/placeholder/300/200',
      rating: 4.9,
      type: 'service'
    },
    {
      id: 3,
      title: 'Laptop - Dell Inspiron',
      description: 'Used Dell Inspiron laptop, perfect for programming and assignments',
      price: 8500,
      category: 'electronics',
      sellerId: 1,
      sellerName: 'John Doe',
      sellerCampus: 'pretoria-main',
      image: '/api/placeholder/300/200',
      rating: 4.5,
      type: 'product'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'books', name: 'Books' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'services', name: 'Services' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'food', name: 'Food' }
  ];

  const campuses = [
    { id: 'all', name: 'All Campuses' },
    { id: 'pretoria-main', name: 'Pretoria Main Campus' },
    { id: 'soshanguve', name: 'Soshanguve Campus' },
    { id: 'ga-rankuwa', name: 'Ga-Rankuwa Campus' },
    { id: 'pretoria-west', name: 'Pretoria West Campus' },
    { id: 'arts', name: 'Arts Campus' },
    { id: 'emalahleni', name: 'eMalahleni Campus' },
    { id: 'mbombela', name: 'Mbombela Campus' },
    { id: 'polokwane', name: 'Polokwane Campus' }
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('tutMarketplaceUsers');
    const savedProducts = localStorage.getItem('tutMarketplaceProducts');
    const savedMessages = localStorage.getItem('tutMarketplaceMessages');
    const savedCurrentUser = localStorage.getItem('tutMarketplaceCurrentUser');
    
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tutMarketplaceUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tutMarketplaceProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tutMarketplaceMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('tutMarketplaceCurrentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleLogin = () => {
    const user = users.find(u => u.email === loginData.email);
    if (user) {
      setCurrentUser(user);
      setShowLogin(false);
      setLoginData({ email: '', password: '' });
    } else {
      alert('User not found. Please register first.');
    }
  };

  const handleRegister = () => {
    if (registerData.name && registerData.email && registerData.userType && registerData.campus) {
      // Check if email already exists
      if (users.some(u => u.email === registerData.email)) {
        alert('This email is already registered. Please login instead.');
        return;
      }
      
      const newUser: User = {
        id: users.length + 1,
        name: registerData.name,
        email: registerData.email,
        type: registerData.userType,
        subscribed: registerData.userType === 'seller',
        campus: registerData.campus
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setShowRegister(false);
      setRegisterData({ name: '', email: '', userType: '', campus: '' });
    } else {
      alert('Please fill all fields.');
    }
  };

  const handleUpgrade = () => {
    if (currentUser) {
      setUsers(users.map(u => 
        u.id === currentUser.id 
          ? { ...u, type: 'seller', subscribed: true }
          : u
      ));
      setCurrentUser({ ...currentUser, type: 'seller', subscribed: true });
      setShowUpgrade(false);
    }
  };

  const handleAddProduct = () => {
    if (
      productData.title &&
      productData.description &&
      productData.price &&
      productData.category &&
      currentUser
    ) {
      const newProduct: Product = {
        id: products.length + 1,
        ...productData,
        price: parseFloat(productData.price),
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerCampus: currentUser.campus,
        rating: 0,
        image: '/api/placeholder/300/200'
      };

      setProducts([...products, newProduct]);
      setCurrentView('home');
      setProductData({ title: '', description: '', price: '', category: '', type: 'product' });
    } else {
      alert('Please fill all required fields.');
    }
  };

  const sendMessage = (receiverId: number) => {
    if (newMessage.trim() && currentUser) {
      const messageKey = `${currentUser.id}-${receiverId}`;
      const reverseKey = `${receiverId}-${currentUser.id}`;
      const currentMessages = messages[messageKey] || messages[reverseKey] || [];

      const newMessageObj: Message = {
        id: Date.now(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages({
        ...messages,
        [messageKey]: [...currentMessages, newMessageObj]
      });
      setNewMessage('');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesCampus = selectedCampus === 'all' || product.sellerCampus === selectedCampus;
    return matchesSearch && matchesCategory && matchesCampus;
  });

  const LoginForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Login to TUT Marketplace</h2>
        <input
          type="email"
          placeholder="TUT Email Address"
          className="w-full p-3 border rounded mb-4"
          value={loginData.email}
          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-4"
          value={loginData.password}
          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
        />
        <div className="flex gap-2">
          <button onClick={handleLogin} className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
            Login
          </button>
          <button onClick={() => setShowLogin(false)} className="flex-1 bg-gray-300 p-3 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <button 
            className="text-blue-600 hover:underline"
            onClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );

  const RegisterForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Register for TUT Marketplace</h2>
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 border rounded mb-4"
          value={registerData.name}
          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
        />
        <input
          type="email"
          placeholder="TUT Email Address"
          className="w-full p-3 border rounded mb-4"
          value={registerData.email}
          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
        />
        <select 
          className="w-full p-3 border rounded mb-4"
          value={registerData.campus}
          onChange={(e) => setRegisterData({...registerData, campus: e.target.value})}
        >
          <option value="">Select Your Campus</option>
          {campuses.slice(1).map(campus => (
            <option key={campus.id} value={campus.id}>{campus.name}</option>
          ))}
        </select>
        <select 
          className="w-full p-3 border rounded mb-4"
          value={registerData.userType}
          onChange={(e) => setRegisterData({...registerData, userType: e.target.value})}
        >
          <option value="">Select Account Type</option>
          <option value="customer">Customer (Free)</option>
          <option value="seller">Seller (R99/month)</option>
        </select>
        <div className="flex gap-2">
          <button onClick={handleRegister} className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700">
            Register
          </button>
          <button onClick={() => setShowRegister(false)} className="flex-1 bg-gray-300 p-3 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            className="text-blue-600 hover:underline"
            onClick={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );

  const UpgradeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Upgrade to Seller Account</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Seller Benefits:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Upload unlimited products and services</li>
            <li>• Direct customer communication</li>
            <li>• Analytics and insights</li>
            <li>• Priority listing placement</li>
          </ul>
        </div>
        <p className="text-lg font-semibold mb-4">Monthly Subscription: R99</p>
        <div className="flex gap-2">
          <button onClick={handleUpgrade} className="flex-1 bg-orange-600 text-white p-3 rounded hover:bg-orange-700">
            Subscribe Now
          </button>
          <button onClick={() => setShowUpgrade(false)} className="flex-1 bg-gray-300 p-3 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const AddProductForm = () => (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Product/Service</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Product/Service Title"
          className="p-3 border rounded"
          value={productData.title}
          onChange={(e) => setProductData({...productData, title: e.target.value})}
        />
        <select 
          className="p-3 border rounded" 
          value={productData.category}
          onChange={(e) => setProductData({...productData, category: e.target.value})}
        >
          <option value="">Select Category</option>
          {categories.slice(1).map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Detailed description"
        className="w-full p-3 border rounded mb-4"
        rows={4}
        value={productData.description}
        onChange={(e) => setProductData({...productData, description: e.target.value})}
      />
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <input
          type="number"
          placeholder="Price (R)"
          className="p-3 border rounded"
          value={productData.price}
          onChange={(e) => setProductData({...productData, price: e.target.value})}
        />
        <select 
          className="p-3 border rounded" 
          value={productData.type}
          onChange={(e) => setProductData({...productData, type: e.target.value})}
        >
          <option value="product">Physical Product</option>
          <option value="service">Service</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={handleAddProduct} className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
          Add Listing
        </button>
        <button onClick={() => setCurrentView('home')} className="bg-gray-300 px-6 py-3 rounded hover:bg-gray-400">
          Cancel
        </button>
      </div>
    </div>
  );

  const ChatWindow = () => {
    if (!currentUser || !chatWith) return <div>Please log in to view messages.</div>;

    const otherUser = users.find(u => u.id === chatWith);
    const messageKey = `${currentUser.id}-${chatWith}`;
    const reverseKey = `${chatWith}-${currentUser.id}`;
    const chatMessages = messages[messageKey] || messages[reverseKey] || [];

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chat with {otherUser?.name}</h3>
            <button onClick={() => setChatWith(null)} className="text-white hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-96 p-4 overflow-y-auto bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No messages yet. Start the conversation!
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`mb-4 ${msg.senderId === currentUser.id ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    msg.senderId === currentUser.id
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p>{msg.text}</p>
                    <small className="opacity-75 block mt-1 text-xs">{msg.timestamp}</small>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 border rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendMessage(chatWith);
                }}
              />
              <button 
                onClick={() => sendMessage(chatWith)}
                className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TUT Marketplace</h1>
            </div>
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 hidden md:inline">Welcome, {currentUser.name}</span>
                {currentUser.type === 'seller' && currentUser.subscribed && (
                  <button 
                    onClick={() => setCurrentView('add-product')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Add Listing</span>
                  </button>
                )}
                {currentUser.type === 'customer' && (
                  <button 
                    onClick={() => setShowUpgrade(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                  >
                    <span className="hidden md:inline">Become a Seller</span>
                    <span className="md:hidden">Upgrade</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    setCurrentView('home');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <button 
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Login
                </button>
                <button 
                  onClick={() => setShowRegister(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {chatWith ? (
          <ChatWindow />
        ) : currentView === 'add-product' ? (
          currentUser?.type === 'seller' && currentUser?.subscribed ? (
            <AddProductForm />
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">You need a seller subscription to add listings.</p>
              <button 
                onClick={() => setShowUpgrade(true)}
                className="mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
              >
                Upgrade to Seller Account
              </button>
            </div>
          )
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products and services..."
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select 
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                  >
                    {campuses.map(campus => (
                      <option key={campus.id} value={campus.id}>{campus.name}</option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-500 hidden md:inline">
                    Filter by campus location
                  </span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <Tag className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                      <span className="text-lg font-bold text-green-600">R{product.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{product.sellerName}</span>
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    {currentUser && currentUser.id !== product.sellerId && (
                      <button 
                        onClick={() => setChatWith(product.sellerId)}
                        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Contact Seller</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">No products found matching your search.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showLogin && <LoginForm />}
      {showRegister && <RegisterForm />}
      {showUpgrade && <UpgradeModal />}
    </div>
  );
};

export default App;