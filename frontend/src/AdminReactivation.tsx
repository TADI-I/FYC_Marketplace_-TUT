import React, { useEffect, useState } from 'react';
import { getReactivationRequests, processReactivationRequest } from './api';
import AdminUsers from '../src/AdminUsers';

type RequestItem = any;
type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

const AdminReactivation: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showUsers, setShowUsers] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'yearly'>('monthly');

  const load = async () => {
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

  useEffect(() => { load(); }, []);

  const handleProcess = async (id: string, action: 'approve' | 'reject') => {
    if (!adminNote.trim()) {
      alert('Please enter a note before processing the request');
      return;
    }

    try {
      await processReactivationRequest(id, action, adminNote, subscriptionType);
      await load();
      setProcessingId(null);
      setAdminNote('');
      setSubscriptionType('monthly');
      alert(`Request ${action}ed successfully`);
    } catch (err: any) {
      alert(err.message || 'Failed to process');
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

  if (loading) return <div>Loading...</div>;

  const filtered = requests.filter(r => tab === 'all' ? true : r.status === tab);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>

      {/* Toggle Users Management */}
      <div className="mb-4">
        <button
          onClick={() => setShowUsers(s => !s)}
          style={{
            backgroundColor: showUsers ? '#2563eb' : '#6b7280',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {showUsers ? 'Hide User Management' : 'Manage Users'}
        </button>
      </div>

      {/* Show Users Component */}
      {showUsers && <AdminUsers />}

      {/* Reactivation Requests Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Reactivation Requests</h3>
        
        {/* Tabs */}
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
          <ul className="space-y-3">
            {filtered.map(r => (
              <li key={r._id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{r.user?.name || r.userId}</div>
                    <div className="text-sm text-gray-600">{r.user?.email}</div>
                    {r.userNote && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <strong>User Note:</strong> {r.userNote}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Requested: {new Date(r.requestedAt).toLocaleString()}
                    </div>
                    <div className="text-xs mt-1">
                      Status: <span style={{
                        fontWeight: 500,
                        color: r.status === 'approved' ? '#16a34a' : r.status === 'rejected' ? '#ef4444' : '#ca8a04'
                      }}>{r.status}</span>
                    </div>
                    {r.processedAt && (
                      <>
                        <div className="text-xs text-gray-500 mt-1">
                          Processed: {new Date(r.processedAt).toLocaleString()}
                        </div>
                        {r.admin && (
                          <div className="text-xs text-gray-500">
                            By: {r.admin.name} ({r.admin.email})
                          </div>
                        )}
                        {r.adminNote && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Admin Note:</strong> {r.adminNote}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Processing Section */}
                {r.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t">
                    {processingId === r._id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Subscription Type
                          </label>
                          <select
                            value={subscriptionType}
                            onChange={(e) => setSubscriptionType(e.target.value as 'monthly' | 'yearly')}
                            className="w-full p-2 border rounded"
                          >
                            <option value="monthly">Monthly (30 days)</option>
                            <option value="yearly">Yearly (365 days)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Admin Note *
                          </label>
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Enter reason for approval/rejection..."
                            className="w-full p-2 border rounded resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProcess(r._id, 'approve')}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProcess(r._id, 'reject')}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                          <button
                            onClick={cancelProcessing}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startProcessing(r._id)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                      >
                        Process Request
                      </button>
                    )}
                  </div>
                )}

                {r.status !== 'pending' && (
                  <div className="mt-3 text-sm text-gray-500 italic">
                    Already processed - no actions available
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminReactivation;