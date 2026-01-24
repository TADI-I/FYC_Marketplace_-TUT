import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUser } from './api';

type User = {
  _id: string;
  name: string;
  email: string;
  campus?: string;
  whatsapp?: string;
  type?: string;
  updatedAt?: string;
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all'|'buyer'|'seller'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<User>>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers(filterType);
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType]);

  const startEdit = (u: User) => {
    setEditingId(u._id);
    setForm({ name: u.name, email: u.email, campus: u.campus, whatsapp: u.whatsapp });
  };

  const save = async () => {
    if (!editingId) return;
    try {
      const resp = await updateUser(editingId, form);
      if (!resp.success) throw new Error(resp.error || 'Update failed');
      setEditingId(null);
      setForm({});
      await load();
      alert('User updated');
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="mt-6 p-4 border rounded bg-white">
      <h3 className="text-lg font-semibold mb-2">Manage Users</h3>

      <div className="mb-3 flex gap-2">
        <button onClick={() => setFilterType('all')} className={filterType === 'all' ? 'font-bold' : ''}>All</button>
        <button onClick={() => setFilterType('buyer')} className={filterType === 'buyer' ? 'font-bold' : ''}>Buyers</button>
        <button onClick={() => setFilterType('seller')} className={filterType === 'seller' ? 'font-bold' : ''}>Sellers</button>
        <button onClick={load} className="ml-auto">Refresh</button>
      </div>

      <div className="space-y-2">
        {users.map(u => (
          <div key={u._id} className="p-3 border rounded flex justify-between items-start">
            <div style={{ minWidth: 0 }}>
              {editingId === u._id ? (
                <>
                  <input className="w-full mb-1" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                  <input className="w-full mb-1" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                  <input className="w-full mb-1" value={form.campus || ''} onChange={e => setForm({...form, campus: e.target.value})} />
                  <input className="w-full" value={form.whatsapp || ''} onChange={e => setForm({...form, whatsapp: e.target.value})} />
                </>
              ) : (
                <>
                  <div className="font-semibold truncate">{u.name} <span className="text-xs text-gray-500">({u.type})</span></div>
                  <div className="text-sm text-gray-600 truncate">{u.email}</div>
                  <div className="text-sm text-gray-600">{u.campus}</div>
                  <div className="text-sm text-gray-600">{u.whatsapp}</div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 ml-4">
              {editingId === u._id ? (
                <>
                  <button onClick={save} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 4 }}>Save</button>
                  <button onClick={() => { setEditingId(null); setForm({}); }} style={{ padding: '0.25rem 0.75rem' }}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(u)} style={{ padding: '0.25rem 0.75rem' }}>Edit</button>
                </>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && <div>No users</div>}
      </div>
    </div>
  );
};

export default AdminUsers;