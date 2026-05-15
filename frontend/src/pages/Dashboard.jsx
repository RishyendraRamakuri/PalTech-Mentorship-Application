import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, X, Plus, Filter, UserPlus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menteeEmail, setMenteeEmail] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchPairings = async () => {
    try {
      const res = await axios.get('/pairings', {
        params: { status: statusFilter, role: roleFilter }
      });
      setPairings(res.data);
    } catch (err) {
      toast.error('Failed to fetch pairings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairings();
  }, [statusFilter, roleFilter]);

  const handleCreatePairing = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/pairings', { menteeEmail });
      toast.success('Pairing created successfully!');
      setIsModalOpen(false);
      setMenteeEmail('');
      fetchPairings();
    } catch (err) {
      toast.error(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error creating pairing');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Pairings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and view your mentorship engagements</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all font-medium"
        >
          <Plus size={18} />
          <span>New Pairing</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 text-gray-500">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none transition-all"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Ended">Ended</option>
        </select>
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none transition-all"
        >
          <option value="">All Roles</option>
          <option value="Mentor">As Mentor</option>
          <option value="Mentee">As Mentee</option>
          <option value="Observer">As Observer</option>
        </select>
      </div>

      {pairings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Users className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Pairings Found</h3>
          <p className="text-gray-500 max-w-sm mb-6">You aren't participating in or observing any mentorship pairings matching these filters.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-medium hover:text-blue-700 flex items-center space-x-1">
            <Plus size={16} /><span>Create your first pairing</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pairings.map(p => {
            let role = 'Observer';
            if (p.mentor._id === user.id) role = 'Mentor';
            else if (p.mentee._id === user.id) role = 'Mentee';

            const statusColors = {
              'Active': 'bg-green-100 text-green-800 border-green-200',
              'Paused': 'bg-yellow-100 text-yellow-800 border-yellow-200',
              'Ended': 'bg-red-100 text-red-800 border-red-200'
            };

            return (
              <Link 
                key={p._id} 
                to={`/pairing/${p._id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:-translate-y-1 hover:shadow-md transition-all block"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {role}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mentor</p>
                    <p className="font-medium text-gray-900 truncate">{p.mentor.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mentee</p>
                    <p className="font-medium text-gray-900 truncate">{p.mentee.name}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    View Details &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <UserPlus size={20} className="text-blue-600" />
                <span>Create New Pairing</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePairing} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mentee's Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={menteeEmail} 
                  onChange={e => setMenteeEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="mentee@example.com"
                />
                <p className="mt-2 text-xs text-gray-500">You will automatically be assigned as the Mentor for this pairing.</p>
              </div>
              <div className="pt-2 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  Create Pairing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
