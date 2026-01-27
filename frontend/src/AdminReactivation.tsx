import React, { useEffect, useState } from 'react';
import { getReactivationRequests, processReactivationRequest, getVerificationRequests, processVerificationRequest } from './api';
import AdminUsers from '../src/AdminUsers';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

type RequestItem = any;
type TabKey = 'all' | 'pending' | 'approved' | 'rejected';
type MainTabKey = 'reactivation' | 'verification' | 'users';

// CRITICAL: Must match backend URL
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
     <rect width='100%' height='100%' fill='#f3f4f6'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial, Helvetica, sans-serif' font-size='22'>Image unavailable</text>
   </svg>`
);

const AdminReactivation: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');
  const [mainTab, setMainTab] = useState<MainTabKey>('reactivation');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [verificationCounts, setVerificationCounts] = useState<Record<string, number>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [verificationProcessingId, setVerificationProcessingId] = useState<string | null>(null);
  const [verificationNote, setVerificationNote] = useState<string>('');

  // Build proper image URL with API_BASE
  const buildImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return FALLBACK_IMAGE;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    const cleanBase = API_BASE.replace(/\/$/, '');
    const cleanPath = imageUrl.replace(/^\/+/, '');
    const cacheBuster = `?t=${Date.now()}`;
    const fullUrl = `${cleanBase}/${cleanPath}${cacheBuster}`;
    
    console.log('🔗 Built image URL:', fullUrl);
    return fullUrl;
  };

  const loadReactivation = async () => {
    setLoading(true);
    try {
      const data = await getReactivationRequests();
      setRequests(data.requests || data || []);
      setCounts(data.counts || {});
    } catch (err) {
      console.error('Failed to load reactivation requests', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVerification = async () => {
    setLoading(true);
    try {
      const data = await getVerificationRequests(verificationFilter);
      setVerificationRequests(data.requests || []);
      setVerificationCounts(data.counts || {});
    } catch (err) {
      console.error('Failed to load verification requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (mainTab === 'reactivation') loadReactivation();
    else if (mainTab === 'verification') loadVerification();
  }, [mainTab, verificationFilter]);

  const handleProcess = async (id: string, action: 'approve' | 'reject') => {
    if (!adminNote.trim()) {
      alert('Please enter a note before processing the request');
      return;
    }

    try {
      await processReactivationRequest(id, action, adminNote, subscriptionType);
      await loadReactivation();
      setProcessingId(null);
      setAdminNote('');
      setSubscriptionType('monthly');
      alert(`Request ${action}ed successfully`);
    } catch (err: any) {
      alert(err.message || 'Failed to process');
    }
  };

  const handleVerificationProcess = async (requestId: string, action: 'approve' | 'reject') => {
    if (!verificationNote.trim()) {
      alert('Please enter a note before processing the verification');
      return;
    }

    try {
      await processVerificationRequest(requestId, action, verificationNote);
      await loadVerification();
      setVerificationProcessingId(null);
      setVerificationNote('');
      alert(`Verification ${action}d successfully`);
    } catch (err: any) {
      alert(err.message || `Failed to ${action} verification`);
    }
  };

  const startProcessing = (id: string) => {
    setProcessingId(id);
    setAdminNote('');
    setSubscriptionType('monthly');
  };

  const cancelProcessing = () => {
    setProcessingId(null);
    setAdminNote('');
    setSubscriptionType('monthly');
  };

  const startVerificationProcessing = (id: string) => {
    setVerificationProcessingId(id);
    setVerificationNote('');
  };

  const cancelVerificationProcessing = () => {
    setVerificationProcessingId(null);
    setVerificationNote('');
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
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#fef3c7',
        color: status === 'approved' ? '#166534' : status === 'rejected' ? '#991b1b' : '#854d0e'
      }}>
        <Icon style={{ width: '0.75rem', height: '0.75rem' }} />
        <span style={{ textTransform: 'capitalize' }}>{status}</span>
      </span>
    );
  };

  if (loading && (mainTab === 'reactivation' ? requests.length === 0 : verificationRequests.length === 0)) {
    return <div>Loading...</div>;
  }

  const filtered = requests.filter(r => tab === 'all' ? true : r.status === tab);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMainTab('reactivation')}
          style={{
            backgroundColor: mainTab === 'reactivation' ? '#2563eb' : '#f3f4f6',
            color: mainTab === 'reactivation' ? 'white' : 'black',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Reactivation Requests
        </button>
        <button
          onClick={() => setMainTab('verification')}
          style={{
            backgroundColor: mainTab === 'verification' ? '#2563eb' : '#f3f4f6',
            color: mainTab === 'verification' ? 'white' : 'black',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Seller Verification
        </button>
        <button
          onClick={() => setMainTab('users')}
          style={{
            backgroundColor: mainTab === 'users' ? '#2563eb' : '#f3f4f6',
            color: mainTab === 'users' ? 'white' : 'black',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          User Management
        </button>
      </div>

      {/* Users Tab */}
      {mainTab === 'users' && <AdminUsers />}

      {/* Reactivation Requests Tab */}
      {mainTab === 'reactivation' && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Reactivation Requests</h3>
          
          {/* Status Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab('all')}
              style={{
                backgroundColor: tab === 'all' ? '#1f2937' : '#f3f4f6',
                color: tab === 'all' ? 'white' : 'black',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              All ({requests.length})
            </button>

            <button
              onClick={() => setTab('pending')}
              style={{
                backgroundColor: tab === 'pending' ? '#2563eb' : '#f3f4f6',
                color: tab === 'pending' ? 'white' : 'black',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Pending ({counts.pending || 0})
            </button>

            <button
              onClick={() => setTab('approved')}
              style={{
                backgroundColor: tab === 'approved' ? '#16a34a' : '#f3f4f6',
                color: tab === 'approved' ? 'white' : 'black',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Approved ({counts.approved || 0})
            </button>

            <button
              onClick={() => setTab('rejected')}
              style={{
                backgroundColor: tab === 'rejected' ? '#dc2626' : '#f3f4f6',
                color: tab === 'rejected' ? 'white' : 'black',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Rejected ({counts.rejected || 0})
            </button>
          </div>

          {/* Requests List */}
          {filtered.length === 0 ? <p>No requests</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(r => (
                <div 
                  key={r._id} 
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {r.user?.name || r.userId}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      {r.user?.email}
                    </div>
                    {r.userNote && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#dbeafe',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}>
                        <strong>User Note:</strong> {r.userNote}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                      Requested: {new Date(r.requestedAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Status: <span style={{
                        fontWeight: 500,
                        color: r.status === 'approved' ? '#16a34a' : r.status === 'rejected' ? '#ef4444' : '#ca8a04'
                      }}>{r.status}</span>
                    </div>
                    {r.processedAt && (
                      <>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Processed: {new Date(r.processedAt).toLocaleString()}
                        </div>
                        {r.admin && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            By: {r.admin.name} ({r.admin.email})
                          </div>
                        )}
                        {r.adminNote && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          }}>
                            <strong>Admin Note:</strong> {r.adminNote}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {r.status === 'pending' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                      {processingId === r._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                              Subscription Type
                            </label>
                            <select
                              value={subscriptionType}
                              onChange={(e) => setSubscriptionType(e.target.value as 'monthly' | 'yearly')}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem'
                              }}
                            >
                              <option value="monthly">Monthly (30 days)</option>
                              <option value="yearly">Yearly (365 days)</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                              Admin Note *
                            </label>
                            <textarea
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              placeholder="Enter reason for approval/rejection..."
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                resize: 'none'
                              }}
                              rows={3}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleProcess(r._id, 'approve')}
                              style={{
                                backgroundColor: '#16a34a',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.25rem',
                                border: 'none',
                                cursor: 'pointer',
                                flex: 1
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcess(r._id, 'reject')}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.25rem',
                                border: 'none',
                                cursor: 'pointer',
                                flex: 1
                              }}
                            >
                              Reject
                            </button>
                            <button
                              onClick={cancelProcessing}
                              style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.25rem',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startProcessing(r._id)}
                          style={{
                            width: '100%',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Process Request
                        </button>
                      )}
                    </div>
                  )}

                  {r.status !== 'pending' && (
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                      Already processed - no actions available
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification Requests Tab */}
      {mainTab === 'verification' && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Seller Verification Requests</h3>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setVerificationFilter(status as any)}
                style={{
                  backgroundColor: verificationFilter === status ? '#2563eb' : '#f3f4f6',
                  color: verificationFilter === status ? 'white' : 'black',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {verificationCounts[status] > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: 'white',
                    color: '#2563eb',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem'
                  }}>
                    {verificationCounts[status]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Verification Requests List */}
          {verificationRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <Clock style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', color: '#d1d5db' }} />
              <p style={{ fontSize: '1.25rem' }}>No {verificationFilter !== 'all' ? verificationFilter : ''} verification requests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {verificationRequests.map((request) => {
                const imageUrl = buildImageUrl(request.imageUrl);
                
                return (
                  <div 
                    key={request._id} 
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {/* ID Photo Thumbnail */}
                      <div style={{ flexShrink: 0 }}>
                        <button
                          onClick={() => setSelectedImage(imageUrl)}
                          style={{
                            position: 'relative',
                            cursor: 'pointer',
                            border: 'none',
                            padding: 0,
                            background: 'none'
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt="ID verification"
                            onError={(e) => {
                              console.error('❌ Image failed:', imageUrl);
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                            }}
                            onLoad={() => console.log('✅ Image loaded:', imageUrl)}
                            style={{
                              width: '8rem',
                              height: '8rem',
                              objectFit: 'cover',
                              borderRadius: '0.5rem',
                              border: '2px solid #d1d5db'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0)'}
                          >
                            <Eye style={{ width: '2rem', height: '2rem', color: 'white', opacity: 0 }} 
                              onMouseEnter={(e) => (e.currentTarget as SVGElement).style.opacity = '1'}
                            />
                          </div>
                        </button>
                      </div>

                      {/* Request Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <div>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                              {request.user?.name || 'Unknown'}
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{request.user?.email}</p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Campus: {request.user?.campus}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                          Requested: {new Date(request.requestedAt).toLocaleString()}
                          {request.processedAt && (
                            <> • Processed: {new Date(request.processedAt).toLocaleString()}</>
                          )}
                        </div>

                        {request.adminNote && (
                          <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            marginBottom: '0.75rem'
                          }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              <strong>Admin Note:</strong> {request.adminNote}
                            </p>
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                            {verificationProcessingId === request._id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                    Admin Note *
                                  </label>
                                  <textarea
                                    value={verificationNote}
                                    onChange={(e) => setVerificationNote(e.target.value)}
                                    placeholder="Enter reason for approval/rejection..."
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '0.375rem',
                                      resize: 'none'
                                    }}
                                    rows={3}
                                  />
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleVerificationProcess(request._id, 'approve')}
                                    style={{
                                      backgroundColor: '#16a34a',
                                      color: 'white',
                                      padding: '0.5rem 1rem',
                                      borderRadius: '0.375rem',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      flex: 1
                                    }}
                                  >
                                    <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleVerificationProcess(request._id, 'reject')}
                                    style={{
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      padding: '0.5rem 1rem',
                                      borderRadius: '0.375rem',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      flex: 1
                                    }}
                                  >
                                    <XCircle style={{ width: '1rem', height: '1rem' }} />
                                    <span>Reject</span>
                                  </button>
                                  <button
                                    onClick={cancelVerificationProcessing}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '0.375rem',
                                      backgroundColor: 'white',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => startVerificationProcessing(request._id)}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#2563eb',
                                  color: 'white',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '0.375rem',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Process Request
                              </button>
                            )}
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
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '64rem', maxHeight: '100%' }}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-2.5rem',
                right: 0,
                color: 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <XCircle style={{ width: '2rem', height: '2rem' }} />
            </button>
            <img
              src={selectedImage}
              alt="ID verification full size"
              onError={(e) => {
                console.error('❌ Full size failed:', selectedImage);
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '0.5rem'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReactivation;