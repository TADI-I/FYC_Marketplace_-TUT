import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, User, Star, Filter, Locate } from 'lucide-react';
import './App.css';
import {
  logoutUser,
  getProducts,
  getCurrentUser,
  upgradeUserToSeller
} from './api';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AddProductForm from './AddProduct';
import ChatWindow from './ChatWindow';
import SellerProducts from './SellerProducts';
import UserProfile from './UserProfile';
import AdminReactivation from './AdminReactivation';
import logo from './assets/facicon.jpeg';

const App = () => {
 
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';
  
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
    image?: {
      id: string;
      filename: string;
      contentType: string;
      uploadDate: Date;
    } | string;
    imageUrl?: string; 
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

  // prefix unused state values with _ to satisfy eslint
  const [_error, setError] = useState<string>('');
  const [_loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // call backend to get fresh user (auth/me)
          const data = await getCurrentUser(); // returns { success, user } or user object depending on your api.js
          const freshUser = data?.user || data;
          if (freshUser) {
            setCurrentUser(freshUser);
            localStorage.setItem('user_data', JSON.stringify(freshUser));
            return;
          }
        }
        const stored = localStorage.getItem('user_data');
        if (stored) setCurrentUser(JSON.parse(stored));
      } catch (err) {
        console.warn('Session restore failed', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setCurrentUser(null);
      }
    };
    restore();
  }, []);

  const [currentView, setCurrentView] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [chatWith, setChatWith] = useState<number | null>(null);
  const [_messages, setMessages] = useState<MessageMap>({});
  const [_newMessage, _setNewMessage] = useState('');
  const [users, _setUsers] = useState<User[]>([]);
  const [maximizedImage, setMaximizedImage] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_totalProducts, setTotalProducts] = useState(0);
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

      const sortedProducts = Array.isArray(response.products) 
        ? response.products.sort((a: Product, b: Product) => a.title.localeCompare(b.title))
        : [];
      setProducts(sortedProducts);
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

  // intentionally ignore exhaustive-deps here to avoid re-creating fetchProducts;
  // fetchProducts is stable for this simple usage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts(1);
  }, []);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'books', name: 'Books' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'services', name: 'Services' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'food', name: 'Food' },
    { id: 'other', name: 'Other' }
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

      const updatedUser = {
        ...currentUser,
        type: 'seller',
        subscribed: true,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setShowUpgrade(false);
      
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

  // fetchProducts is stable for this usage, skip exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory, selectedCampus, searchTerm]);

  const handleLoginSuccess = (user: any, token?: string) => {
    setCurrentUser(user);
    try {
      if (token) localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user)); // store full user including whatsapp
    } catch (e) { console.warn('Failed to persist session', e); }
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

  const getImageUrl = (product: Product) => {
    if (product.imageUrl) return product.imageUrl;
    if (typeof product.image === 'object' && product.image?.id) {
      return `${API_BASE}/images/${product.image.id}`;
    }
    if (typeof product.image === 'string') {
      return product.image;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

                {/* Admin button: visible only for admin users */}
                {currentUser.type === 'admin' && (
                  <button
                    onClick={() => setCurrentView('admin-reactivation')}
                    style={{
                      backgroundColor: '#166534',   // Tailwind's green-800 hex
                      color: 'white',
                      padding: '0.5rem 0.75rem',    // px-3 py-2 equivalent
                      borderRadius: '0.25rem',      // rounded equivalent
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803d'; // Tailwind green-700
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#166534'; // back to green-800
                    }}
                    title="Admin: Reactivation Requests"
                  >
                    Admin
                  </button>

                )}

                {currentUser.type === 'seller' && currentUser.subscribed && (
                  <button 
                    onClick={() => setCurrentView('add-product')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Add Listing</span>
                  </button>
                )}
              
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
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
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
        ) : currentView === 'admin-reactivation' && currentUser?.type === 'admin' ? (
          <AdminReactivation />
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              {currentUser?.type === 'seller' && (
                <button 
                  onClick={() => setCurrentView('my-products')}
                  style={{
                    backgroundColor: 'orange',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  My Products
                </button>
              )}
            </div>

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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => {
                const imageUrl = getImageUrl(product);
                const raw = (product as any).sellerWhatsApp || (product as any).seller?.whatsapp || (product as any).whatsapp || '';
                const normalized = raw ? String(raw).replace(/\D/g, '') : '';
                const waMessage = encodeURIComponent(`Hi ${product.sellerName || ''}, I'm interested in your listing "${product.title}".`);
                const waLink = normalized ? `https://wa.me/${normalized}?text=${waMessage}` : null;

                return (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative overflow-hidden" style={{ height: '25rem' }}> {/* adjust height as needed */}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => setMaximizedImage(imageUrl)}
                          onError={(e) => {
                            const imgElement = e.currentTarget as HTMLImageElement;
                            imgElement.src = 'https://via.placeholder.com/560x420?text=No+Image';
                            imgElement.className = 'absolute inset-0 w-full h-full object-cover object-center bg-gray-200';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                        <span className="text-lg font-bold text-green-600">R{product.price}</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-500 space-x-6">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{product.sellerName}</span>
                          </div>
                          <div className="flex items-center">
                            <Locate className="h-4 w-4 mr-1" />
                            <span>{product.sellerCampus}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {product.rating > 0 && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  style={{
                                    backgroundColor: '#16a34a',   // Tailwind green-600 hex
                                    color: 'white',
                                    padding: '0.5rem 0.75rem',    // px-3 py-2 equivalent
                                    borderRadius: '0.25rem',      // rounded
                                    border: 'none',
                                    cursor: 'pointer',
                                    textDecoration: 'none',       // removes underline
                                    transition: 'background-color 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#15803d'; // green-700
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#16a34a'; // back to green-600
                                  }}
                                  title="Contact seller on WhatsApp"
                                >
                                  WhatsApp Me
                                </a>
                              )}
                            


                           {product?.id && (
  <button
    type="button"
    onClick={async () => {
      try {
        const shareUrl = `${window.location.origin}/product/${product.id}`;
        const shareData = {
          title: product.title,
          text: `Check out this listing: ${product.title}`,
          url: shareUrl
        };
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareUrl);
          alert('Product link copied to clipboard');
        }
      } catch (err) {
        console.error('Share failed', err);
        alert('Unable to share this product right now.');
      }
    }}
    className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
    title="Share listing"
  >
    Share
  </button>
)}

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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

            {products.length === 0 && (
              <div className="text-center py-20">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500">No products found matching your search.</p>
              </div>
            )}
          </>
        )}
      </main>

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

      {maximizedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setMaximizedImage(null)}
          style={{ cursor: 'pointer' }}
        >
          <div className="relative" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMaximizedImage(null);
              }}
              className="absolute flex items-center justify-center text-white rounded-full transition-all z-50"
              aria-label="Close"
              style={{ 
                cursor: 'pointer',
                top: '-20px',
                right: '-20px',
                width: '30px',
                height: '30px',
                backgroundColor: '#dc2626',
                border: '3px solid white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
              }}
            >
              <svg style={{ width: '40px', height: '40px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={maximizedImage ?? undefined}
              alt="Maximized view"
              className="object-contain"
              style={{ 
                maxWidth: '90vw', 
                maxHeight: '90vh',
                cursor: 'default'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;