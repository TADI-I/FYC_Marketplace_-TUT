import React, { useState } from "react";
import { createProduct } from './api'; 

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

type User = {
  id: number;
  name: string;
  email: string;
  type: string;
  subscribed: boolean;
  campus: string;
};

type Category = {
  id: string;
  name: string;
};

interface AddProductFormProps {
  currentUser: User | null;
  onProductAdded: (product: Product) => void;
  onCancel: () => void;
}

const categories: Category[] = [
  { id: 'all', name: 'All Items' },
    { id: 'books', name: 'Books' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'services', name: 'Services' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'food', name: 'Food' }
];

const AddProductForm: React.FC<AddProductFormProps> = ({ currentUser, onProductAdded, onCancel }) => {
  const [productData, setProductData] = useState({
    title: '', 
    description: '', 
    price: '', 
    category: '', 
    type: 'product'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddProduct = async () => {
    if (!currentUser) {
      setError('You must be logged in to add a product');
      return;
    }

    if (!productData.title || !productData.description || !productData.price || !productData.category) {
      setError('Please fill all required fields.');
      return;
    }

    if (parseFloat(productData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create product data with seller information
      const productToCreate = {
        ...productData,
        price: parseFloat(productData.price),
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerCampus: currentUser.campus,
        rating: 0,
        image: '/api/placeholder/300/200',
        type: productData.type || 'product'
      };

      // Call the API to create the product
      const createdProduct = await createProduct(productToCreate);

      // Call the parent callback
      onProductAdded(createdProduct);
      
      // Reset form
      setProductData({ title: '', description: '', price: '', category: '', type: 'product' });
      
      console.log('✅ Product added successfully');
      
    } catch (error) {
      console.error('❌ Failed to add product:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'Failed to add product. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Product/Service</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Product/Service Title"
          className="p-3 border rounded"
          value={productData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          disabled={loading}
        />
        <select 
          className="p-3 border rounded" 
          value={productData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          disabled={loading}
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
        onChange={(e) => handleInputChange('description', e.target.value)}
        disabled={loading}
      />
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <input
          type="number"
          placeholder="Price (R)"
          className="p-3 border rounded"
          value={productData.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          min="0"
          step="0.01"
          disabled={loading}
        />
        <select 
          className="p-3 border rounded" 
          value={productData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          disabled={loading}
        >
          <option value="product">Physical Product</option>
          <option value="service">Service</option>
        </select>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleAddProduct} 
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Listing'}
        </button>
        <button 
          onClick={onCancel} 
          disabled={loading}
          className="bg-gray-300 px-6 py-3 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddProductForm;