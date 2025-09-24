import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Plus, Search, User, Star, Tag, Filter, X, Locate } from 'lucide-react';
import './App.css';
import {
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  getProducts,
  generateConversationId,
  testConnection,    // New  
  upgradeUserToSeller     // New
} from './api';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AddProductForm from './AddProduct';
import ChatWindow from './ChatWindow';
import SellerProducts from './SellerProducts';
import UserProfile from './UserProfile';
import logo from './assets/facicon.jpeg';

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
    receiverId: number;
    text: string;
    timestamp: string;
    read: boolean;
  };
  

  type MessageMap = {
    [key: string]: Message[];
  };

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
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
  const [users, setUsers] = useState<User[]>([]); // Add users state
 

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const fetchProducts = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const response = await getProducts({
        page,
        limit: 12,
        category: selectedCategory !== 'all' ? selectedCategory : '',
        campus: selectedCampus !== 'all' ? selectedCampus : '',
        search: searchTerm || '',
        ...filters
      });

      setProducts(response.products);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalProducts(response.pagination.totalProducts);
      setHasNext(response.pagination.hasNext);
      setHasPrev(response.pagination.hasPrev);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line
  }, []);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'books', name: 'Books' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'services', name: 'Services' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'food', name: 'Food' }
  ];

  const campuses = [
    { id: 'all', name: 'All Locations' },
    { id: 'pretoria-main', name: 'Pretoria Central ' },
    { id: 'soshanguve-S', name: 'Soshanguve South' },
    { id: 'soshanguve-N', name: 'Soshanguve North' },
    { id: 'ga-rankuwa', name: 'Ga-Rankuwa ' },
    { id: 'pretoria-west', name: 'Pretoria Arcadia ' },
    { id: 'arts', name: 'Arts ' },
    { id: 'emalahleni', name: 'eMalahleni ' },
    { id: 'mbombela', name: 'Mbombela ' },
    { id: 'polokwane', name: 'Polokwane ' }
  ];

  // Load data from localStorage on component mount
  
  const handleUpgrade = async () => {
  if (!currentUser) {
    setError('User not found');
    return;
  }

  setLoading(true);
  setError('');

  try {
    console.log('⬆️ Upgrading user to seller:', currentUser.name);
    
    const response = await upgradeUserToSeller(currentUser.id, 'monthly');
    
    console.log('✅ Upgrade successful:', response);

    // Update the current user state
    const updatedUser = {
      ...currentUser,
      type: 'seller',
      subscribed: true,
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    setCurrentUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    setShowUpgrade(false);
    
    // Show success message
    setTimeout(() => {
      alert('Congratulations! Your account has been upgraded to a seller account. You can now add products and services.');
    }, 100);

  } catch (error) {
    let errorMessage = 'Upgrade failed. Please try again.';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }
    console.error('❌ Upgrade failed:', errorMessage);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
  };

    const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      (product.title?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesCampus = selectedCampus === 'all' || product.sellerCampus === selectedCampus;
    return matchesSearch && matchesCategory && matchesCampus;
  });


 const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowLogin(false);
  };

    const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };
 

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
        <p className="text-lg font-semibold mb-4">Monthly Subscription: R25</p>
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


  const handleNewMessage = (message: Message) => {
  if (!currentUser || !chatWith) return;
  
  const key = `${Math.min(currentUser.id, chatWith)}-${Math.max(currentUser.id, chatWith)}`;
  setMessages(prev => ({
    ...prev,
    [key]: [...(prev[key] || []), message]
  }));
};

    const handleLoadMessages = (loadedMessages: Message[]) => {
      if (!currentUser || !chatWith) return;
      
      const key = `${Math.min(currentUser.id, chatWith)}-${Math.max(currentUser.id, chatWith)}`;
      setMessages(prev => ({
        ...prev,
        [key]: loadedMessages
      }));
    };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img className="h-8 w-8" src={logo} alt="FYC Marketplace Logo" />
              <h1 className="text-2xl font-bold text-gray-900">FYC Marketplace</h1>
            </div>
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 hidden md:inline">Welcome, {currentUser.name}</span>
                {currentUser.type === 'seller' && currentUser.subscribed && (
                  <button 
                    onClick={() => setCurrentView('add-product')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Add Listing</span>
                  </button>
                )}
              
                {/* Profile Icon Button */}
                <button 
                  onClick={() => setCurrentView('my-profile')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  title="My Profile"
                >
                  <User className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                
                </button>

                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    setCurrentView('home');
                  }}
                  style={{
                    backgroundColor: '#ef4444', // Tailwind's bg-red-500
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4b5563'; // Tailwind's bg-gray-600
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444'; // Reset to red-500
                  }}
                >
                  Logout
                </button>

               
              </div>
            )  : (
              <div className="space-x-2">
                <button 
                  onClick={() => setShowLogin(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Login
                </button>
                <button 
                  onClick={() => setShowRegister(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
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
      <ChatWindow
        currentUser={currentUser}
        chatWith={chatWith}
        users={users}
        onCloseChat={() => setChatWith(null)}
        onNewMessage={handleNewMessage}
        onLoadMessages={handleLoadMessages}
      />
    ) : currentView === 'add-product' ? (
      currentUser?.type === 'seller' && currentUser?.subscribed ? (
        <AddProductForm 
          currentUser={currentUser}
          onProductAdded={(newProduct) => {
            setProducts(prev => [...prev, newProduct]);
            setCurrentView('home');
          }}
          onCancel={() => setCurrentView('home')}
        />
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
    ) : currentView === 'my-products' ? (
      
      <SellerProducts 
        currentUser={currentUser}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onBack={() => setCurrentView('home')}
        onAddProduct={() => setCurrentView('add-product')}
      />
    ) : currentView === 'my-profile' ? (
      <UserProfile 
        currentUser={currentUser}
        onLogout={handleLogout}
        onBack={() => setCurrentView('home')}
      />
    ) :
    
    (
      // Home View (default)
      <>
        {/* Header with My Products button */}
        <div className="flex justify-between items-center mb-8">
          
          {currentUser?.type === 'seller' && (
            <button 
              onClick={() => setCurrentView('my-products')}
              style={{
                backgroundColor: 'orange',
                alignItems: 'right',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'orange';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'orange';
              }}
            >
              My Products
            </button>

          )}
        </div>

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
              {/*<div className="h-48 bg-gray-200 flex items-center justify-center">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>*/}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                  <span className="text-lg font-bold text-green-600">R{product.price}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>{product.sellerName} </span>
                  </div> 
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Locate className="h-4 w-4 mr-1" />
                        <span>{product.sellerCampus}</span>
                      </div>
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  )}
                </div>
                {/*currentUser && currentUser.id !== product.sellerId && (
                  <button 
                    onClick={() => setChatWith(product.sellerId)}
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact Seller</span>
                  </button>
                )*/}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => fetchProducts(currentPage - 1)}
              disabled={!hasPrev}
            >
              Previous
            </button>
            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => fetchProducts(currentPage + 1)}
              disabled={!hasNext}
            >
              Next
            </button>
          </div>
        )}

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
      {showLogin && (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onShowRegister={() => setShowRegister(true)}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showRegister && (
        <RegisterForm
          onRegisterSuccess={(user) => {
            setCurrentUser(user);
            setShowRegister(false);
          }}
          onShowLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
          onClose={() => setShowRegister(false)}
        />
      )}
      {showUpgrade && <UpgradeModal />}
    </div>
  );
};

export default App;
