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
      <button
          onClick={() => setTab('all')}
          className={`px-3 py-1 rounded ${tab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
        >
          All ({requests.length})
        </button>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('pending')}
          className={`px-3 py-1 rounded ${tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Pending ({counts.pending || 0})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`px-3 py-1 rounded ${tab === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
        >
          Approved ({counts.approved || 0})
        </button>
        <button
          onClick={() => setTab('rejected')}
          className={`px-3 py-1 rounded ${tab === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
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
                  Status: <span className={`font-medium ${r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{r.status}</span>
                </div>
                {r.processedAt && <div className="text-xs text-gray-500">Processed: {new Date(r.processedAt).toLocaleString()}</div>}
              </div>
              <div className="flex flex-col gap-2">
                {r.status === 'pending' ? (
                  <>
                    <button onClick={() => handleProcess(r._id, 'approve')} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                    <button onClick={() => handleProcess(r._id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
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