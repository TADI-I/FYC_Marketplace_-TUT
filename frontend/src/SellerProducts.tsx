import React, { useState, useEffect } from 'react';
import { Edit, Trash2, ArrowLeft, Plus, Loader } from 'lucide-react';
import { deleteProduct, updateProduct, getProductsBySeller } from './api';

type Product = {
  id: number;
  _id?: string; 
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

const getProductId = (product: Product): string => {
  // Always return string for API calls
  return product._id ? product._id.toString() : product.id.toString();
};

type User = {
  id: number;
  _id?: string;
  name: string;
  email: string;
  type: string;
  subscribed: boolean;
  campus: string;
};

interface SellerProductsProps {
  currentUser: User | null;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onBack: () => void;
  onAddProduct: () => void;
}

const SellerProducts: React.FC<SellerProductsProps> = ({
  currentUser,
  onEditProduct,
  onDeleteProduct,
  onBack,
  onAddProduct
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    type: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Fetch seller's products when component mounts or currentUser changes
  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!currentUser?._id) {
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        setError('');
        
        const sellerProducts = await getProductsBySeller(currentUser._id.toString());
        setProducts(sellerProducts);
      } catch (err) {
        setError('Failed to load your products. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchSellerProducts();
  }, [currentUser]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      type: product.type
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      type: ''
    });
    setError('');
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    const productId = getProductId(editingProduct);
    if (!productId) {
      setError('Invalid product ID');
      return;
    }

    if (!editFormData.title || !editFormData.description || !editFormData.price || !editFormData.category) {
      setError('Please fill all required fields.');
      return;
    }

    if (parseFloat(editFormData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedProduct = await updateProduct(productId, {
        title: editFormData.title,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        category: editFormData.category,
        type: editFormData.type,
        image: editingProduct.image || null
      });

      // Update local state
      setProducts(prev => prev.map(p => 
        getProductId(p) === productId ? { ...p, ...updatedProduct } : p
      ));
      
      onEditProduct(updatedProduct);
      setEditingProduct(null);
      setEditFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        type: ''
      });
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Failed to update product. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (product: Product) => {
    const productId = getProductId(product);
    
    if (!productId) {
      alert('Invalid product. Please try again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await deleteProduct(productId);
      
      // Update local state
      setProducts(prev => prev.filter(p => getProductId(p) !== productId));
      
      // Convert string ID back to number for the callback if needed
      const numericId = product.id || parseInt(productId) || 0;
      onDeleteProduct(numericId);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete product. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.type !== 'seller') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600 mt-2">You need to be a seller to access this page.</p>
          <button 
            onClick={onBack}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Loading your products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold">My Products</h1>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </span>
        </div>
        <button 
          onClick={onAddProduct}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Edit Form */}
      {editingProduct && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold mb-4">Edit Product</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Product Title"
              className="p-3 border rounded"
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={loading}
            />
            <select 
              className="p-3 border rounded" 
              value={editFormData.category}
              onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
              disabled={loading}
            >
              <option value="">Select Category</option>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
              <option value="services">Services</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
            </select>
          </div>
          
          <textarea
            placeholder="Description"
            className="w-full p-3 border rounded mb-4"
            rows={3}
            value={editFormData.description}
            onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
            disabled={loading}
          />
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              placeholder="Price (R)"
              className="p-3 border rounded"
              value={editFormData.price}
              onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
              min="0"
              step="0.01"
              disabled={loading}
            />
            <select 
              className="p-3 border rounded" 
              value={editFormData.type}
              onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value }))}
              disabled={loading}
            >
              <option value="product">Physical Product</option>
              <option value="service">Service</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleUpdateProduct}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
            <button 
              onClick={handleCancelEdit}
              disabled={loading}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first product listing!</p>
          <button 
            onClick={onAddProduct}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={getProductId(product)} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg truncate">{product.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.type === 'service' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-green-600">R{product.price}</span>
                  <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(product)}
                    disabled={loading || editingProduct !== null}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(product)}
                    disabled={loading}
                    className="flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;