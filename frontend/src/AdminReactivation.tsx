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
    try {
      await processReactivationRequest(id, action);
      await load();
      alert(`Request ${action}ed`);
    } catch (err: any) {
      alert(err.message || 'Failed to process');
    }
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
          {/* All tab */}
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

          {/* Pending tab */}
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

          {/* Approved tab */}
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

          {/* Rejected tab */}
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
              <li key={r._id} className="p-3 border rounded flex justify-between items-start">
                <div>
                  <div className="font-semibold">{r.user?.name || r.userId}</div>
                  <div className="text-sm text-gray-600">{r.user?.email}</div>
                  <div className="text-sm mt-2">{r.note}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Requested: {new Date(r.requestedAt).toLocaleString()}
                  </div>
                  <div className="text-xs mt-1">
                    Status: <span style={{
                      fontWeight: 500,
                      color: r.status === 'approved' ? '#16a34a' : r.status === 'rejected' ? '#ef4444' : '#ca8a04'
                    }}>{r.status}</span>
                  </div>
                  {r.processedAt && (
                    <div className="text-xs text-gray-500">
                      Processed: {new Date(r.processedAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {r.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleProcess(r._id, 'approve')}
                        style={{
                          backgroundColor: '#16a34a',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcess(r._id, 'reject')}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">No actions</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminReactivation;