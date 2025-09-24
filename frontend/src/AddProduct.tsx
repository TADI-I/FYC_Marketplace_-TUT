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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

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
      let imageUrl = '/api/placeholder/300/200'; // Default placeholder

      // If an image was selected, upload it first
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Create product data with seller information
      const productToCreate = {
        ...productData,
        price: parseFloat(productData.price),
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        sellerCampus: currentUser.campus,
        rating: 0,
        image: imageUrl,
        type: productData.type || 'product'
      };

      // Call the API to create the product
      const createdProduct = await createProduct(productToCreate);

      // Call the parent callback
      onProductAdded(createdProduct);
      
      // Reset form
      setProductData({ title: '', description: '', price: '', category: '', type: 'product' });
      setImageFile(null);
      setImagePreview('');
      
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

  // Simulate image upload - replace this with your actual upload API
  const uploadImage = async (file: File): Promise<string> => {
    // This is a mock implementation. Replace with your actual image upload logic
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, you would upload to a service like Cloudinary, AWS S3, or your backend
        // For now, we'll use a placeholder and store the file locally
        const mockImageUrl = URL.createObjectURL(file);
        resolve(mockImageUrl);
      }, 1000);
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Product/Service</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WebP accepted. Max 5MB.
            </p>
          </div>
          
          {imagePreview && (
            <div className="relative">
              <img 
  src={imagePreview} 
  alt="Preview" 
  style={{
    width: '7rem',           // Tailwind's w-8
    height: '7rem',          // Tailwind's h-8
    objectFit: 'cover',      // Tailwind's object-cover
    borderRadius: '0.5rem',  // Tailwind's rounded
    border: '1px solid #ccc' // Tailwind's border
  }}
/>

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={loading}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

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
          className="bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed"
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