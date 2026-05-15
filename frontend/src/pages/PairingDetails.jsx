import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus, X, Play, Pause, Square, MessageSquare, Calendar, Target } from 'lucide-react';
import OneOnOnes from '../components/OneOnOnes';
import Feedback from '../components/Feedback';
import KRAs from '../components/KRAs';

const PairingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [pairing, setPairing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isObserverModalOpen, setIsObserverModalOpen] = useState(false);
  const [observerEmail, setObserverEmail] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('1on1s');

  const fetchPairing = async () => {
    try {
      const res = await axios.get(`/pairings/${id}`);
      setPairing(res.data.pairing);
    } catch (err) {
      toast.error('Error fetching pairing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairing();
  }, [id]);

  const handleAddObserver = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/pairings/${id}/observers`, { email: observerEmail });
      toast.success('Observer added');
      setIsObserverModalOpen(false);
      setObserverEmail('');
      fetchPairing();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error adding observer');
    }
  };

  const handleRemoveObserver = async (observerId) => {
    if (!window.confirm('Remove this observer?')) return;
    try {
      await axios.delete(`/pairings/${id}/observers/${observerId}`);
      toast.success('Observer removed');
      fetchPairing();
    } catch (err) {
      toast.error('Error removing observer');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    try {
      await axios.put(`/pairings/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchPairing();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div></div>;
  if (!pairing) return <div className="text-center py-20 text-gray-500">Pairing not found.</div>;

  const currentUserId = user.id || user._id;
  const isParticipant = pairing.mentor._id === currentUserId || pairing.mentee._id === currentUserId;
  const isEnded = pairing.status === 'Ended';

  const statusColors = {
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'Paused': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Ended': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </Link>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${statusColors[pairing.status]}`}>
                {pairing.status}
              </span>
              <span className="text-sm text-gray-500">
                Created {new Date(pairing.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Mentorship Engagement</h1>
            
            <div className="flex items-center space-x-8 mt-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mentor</p>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {pairing.mentor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 leading-tight">{pairing.mentor.name}</p>
                    <p className="text-xs text-gray-500">{pairing.mentor.email}</p>
                  </div>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mentee</p>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {pairing.mentee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 leading-tight">{pairing.mentee.name}</p>
                    <p className="text-xs text-gray-500">{pairing.mentee.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isParticipant && !isEnded && (
            <div className="flex flex-col space-y-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
              <button onClick={() => setIsObserverModalOpen(true)} className="flex items-center justify-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                <UserPlus size={16} /> <span>Add Observer</span>
              </button>
              {pairing.status === 'Active' && (
                <button onClick={() => handleStatusChange('Paused')} className="flex items-center justify-center space-x-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                  <Pause size={16} /> <span>Pause Pairing</span>
                </button>
              )}
              {pairing.status === 'Paused' && (
                <button onClick={() => handleStatusChange('Active')} className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                  <Play size={16} /> <span>Resume Pairing</span>
                </button>
              )}
              <button onClick={() => handleStatusChange('Ended')} className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                <Square size={16} /> <span>End Pairing</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Observers Bar */}
      {pairing.observers && pairing.observers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 mr-2">Observers:</span>
          {pairing.observers.map(obs => (
            <div key={obs._id} className="flex items-center bg-gray-50 border border-gray-200 rounded-full pl-3 pr-1 py-1">
              <span className="text-xs font-medium text-gray-700 mr-2">{obs.name}</span>
              {isParticipant && !isEnded && (
                <button onClick={() => handleRemoveObserver(obs._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('1on1s')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-all ${activeTab === '1on1s' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Calendar size={18} />
            <span>1:1 Sessions</span>
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-all ${activeTab === 'feedback' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <MessageSquare size={18} />
            <span>Feedback</span>
          </button>
          <button 
            onClick={() => setActiveTab('kras')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center space-x-2 transition-all ${activeTab === 'kras' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Target size={18} />
            <span>KRAs & KPIs</span>
          </button>
        </div>

        <div className="p-6 bg-gray-50/30">
          {activeTab === '1on1s' && <OneOnOnes pairingId={id} isParticipant={isParticipant} isEnded={isEnded} />}
          {activeTab === 'feedback' && <Feedback pairingId={id} isParticipant={isParticipant} isEnded={isEnded} />}
          {activeTab === 'kras' && <KRAs pairingId={id} isParticipant={isParticipant} isEnded={isEnded} />}
        </div>
      </div>

      {/* Add Observer Modal */}
      {isObserverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <UserPlus size={20} className="text-blue-600" />
                <span>Add Observer</span>
              </h3>
              <button onClick={() => setIsObserverModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddObserver} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observer's Email</label>
                <input 
                  type="email" 
                  required 
                  value={observerEmail} 
                  onChange={e => setObserverEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="observer@example.com"
                />
              </div>
              <div className="pt-2 flex space-x-3">
                <button type="button" onClick={() => setIsObserverModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  Add Observer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PairingDetails;
