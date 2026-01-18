import React, { useEffect, useState } from 'react';
import { getReactivationRequests, processReactivationRequest } from './api';

type RequestItem = any;
type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

const AdminReactivation: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReactivationRequests(); // backend now returns all + counts
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
    <h2 className="text-xl font-bold mb-4">Reactivation Requests</h2>

    {/* All tab */}
    <button
      onClick={() => setTab('all')}
      style={{
        backgroundColor: tab === 'all' ? '#1f2937' : '#f3f4f6', // gray-800 vs gray-100
        color: tab === 'all' ? 'white' : 'black',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.25rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (tab === 'all') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#374151'; // gray-700
      }}
      onMouseLeave={(e) => {
        if (tab === 'all') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1f2937'; // gray-800
      }}
    >
      All ({requests.length})
    </button>

    <div className="flex gap-2 mb-4">
      {/* Pending tab */}
      <button
        onClick={() => setTab('pending')}
        style={{
          backgroundColor: tab === 'pending' ? '#2563eb' : '#f3f4f6', // blue-600 vs gray-100
          color: tab === 'pending' ? 'white' : 'black',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.25rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (tab === 'pending') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1d4ed8'; // blue-700
        }}
        onMouseLeave={(e) => {
          if (tab === 'pending') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb'; // blue-600
        }}
      >
        Pending ({counts.pending || 0})
      </button>

      {/* Approved tab */}
      <button
        onClick={() => setTab('approved')}
        style={{
          backgroundColor: tab === 'approved' ? '#16a34a' : '#f3f4f6', // green-600 vs gray-100
          color: tab === 'approved' ? 'white' : 'black',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.25rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (tab === 'approved') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803d'; // green-700
        }}
        onMouseLeave={(e) => {
          if (tab === 'approved') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#16a34a'; // green-600
        }}
      >
        Approved ({counts.approved || 0})
      </button>

      {/* Rejected tab */}
      <button
        onClick={() => setTab('rejected')}
        style={{
          backgroundColor: tab === 'rejected' ? '#dc2626' : '#f3f4f6', // red-600 vs gray-100
          color: tab === 'rejected' ? 'white' : 'black',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.25rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (tab === 'rejected') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b91c1c'; // red-700
        }}
        onMouseLeave={(e) => {
          if (tab === 'rejected') (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626'; // red-600
        }}
      >
        Rejected ({counts.rejected || 0})
      </button>
    </div>

    {filtered.length === 0 ? <p>No requests</p> : (
      <ul className="space-y-3">
        {filtered.map(r => (
          <li key={r._id} className="p-3 border rounded flex justify-between items-start">
            <div>
              <div className="font-semibold">{r.user?.name || r.userId}</div>
              <div className="text-sm text-gray-600">{r.user?.email}</div>
              <div className="text-sm mt-2">{r.note}</div>
              <div className="text-xs text-gray-500 mt-1">Requested: {new Date(r.requestedAt).toLocaleString()}</div>
              <div className="text-xs mt-1">
                Status: <span style={{
                  fontWeight: 500,
                  color: r.status === 'approved' ? '#16a34a' : r.status === 'rejected' ? '#ef4444' : '#ca8a04' // green/red/yellow
                }}>{r.status}</span>
              </div>
              {r.processedAt && <div className="text-xs text-gray-500">Processed: {new Date(r.processedAt).toLocaleString()}</div>}
            </div>
            <div className="flex flex-col gap-2">
              {r.status === 'pending' ? (
                <>
                  {/* Approve button */}
                  <button
                    onClick={() => handleProcess(r._id, 'approve')}
                    style={{
                      backgroundColor: '#16a34a', // green-600
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803d'; // green-700
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#16a34a'; // back to green-600
                    }}
                  >
                    Approve
                  </button>

                  {/* Reject button */}
                  <button
                    onClick={() => handleProcess(r._id, 'reject')}
                    style={{
                      backgroundColor: '#ef4444', // red-500
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626'; // darker red
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444'; // back to red
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
);

};

export default AdminReactivation;