// AdminVerification.tsx - Fixed with aggressive cache busting
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { getVerificationRequests, processVerificationRequest } from './api';

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
     <rect width='100%' height='100%' fill='#f3f4f6'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='22'>Image unavailable</text>
   </svg>`
);

const AdminVerification: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [counts, setCounts] = useState<any>({});

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getVerificationRequests(filter);
      console.log('✅ Verification requests loaded:', data.requests?.length || 0);
      setRequests(data.requests || []);
      setCounts(data.counts || {});
    } catch (err) {
      console.error('Failed to fetch verification requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (requestId: string, action: 'approve' | 'reject', note: string = '') => {
    setProcessing(requestId);
    try {
      await processVerificationRequest(requestId, action, note);
      await fetchRequests();
      alert(`Verification ${action}d successfully`);
    } catch (err: any) {
      alert(err.message || `Failed to ${action} verification`);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  // Build image URL with aggressive cache busting
  const buildImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return FALLBACK_IMAGE;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    const cleanBase = API_BASE.replace(/\/$/, '');
    const cleanPath = imageUrl.replace(/^\/+/, '');
    
    // Add timestamp + random to force fresh load every time
    const cacheBuster = `v=${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullUrl = `${cleanBase}/${cleanPath}?${cacheBuster}`;
    
    console.log('🔗 Built image URL:', fullUrl);
    return fullUrl;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Seller Verification Requests</h2>

        <div className="flex space-x-2 mb-6">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {counts[status] > 0 && (
                <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  {counts[status]}
                </span>
              )}
            </button>
          ))}
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No {filter !== 'all' ? filter : ''} verification requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const imageUrl = buildImageUrl(request.imageUrl);
              
              return (
                <div key={request._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setSelectedImage(imageUrl)}
                        className="relative group"
                      >
                        <img
                          src={imageUrl}
                          alt="ID verification"
                          onError={(e) => { 
                            console.error('❌ Image failed:', imageUrl);
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; 
                          }}
                          onLoad={() => console.log('✅ Image loaded:', imageUrl)}
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                          <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{request.user?.name || 'Unknown'}</h3>
                          <p className="text-sm text-gray-600">{request.user?.email}</p>
                          <p className="text-sm text-gray-500">Campus: {request.user?.campus}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Requested: {new Date(request.requestedAt).toLocaleString()}
                        {request.processedAt && (
                          <> • Processed: {new Date(request.processedAt).toLocaleString()}</>
                        )}
                      </div>

                      {request.adminNote && (
                        <div className="bg-gray-50 rounded p-2 mb-3">
                          <p className="text-xs text-gray-600">
                            <strong>Admin Note:</strong> {request.adminNote}
                          </p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const note = prompt('Add an optional note (or leave blank):');
                              if (note !== null) handleProcess(request._id, 'approve', note);
                            }}
                            disabled={processing === request._id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('Reason for rejection:');
                              if (note) handleProcess(request._id, 'reject', note);
                            }}
                            disabled={processing === request._id}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
          style={{ cursor: 'pointer' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-red-600 hover:bg-red-700 rounded-full transition-all z-50 shadow-lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="ID verification full size"
            onError={(e) => { 
              console.error('❌ Full size failed:', selectedImage);
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; 
            }}
            className="object-contain"
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default AdminVerification;