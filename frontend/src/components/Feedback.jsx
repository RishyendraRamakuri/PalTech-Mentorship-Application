import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, MessageSquare, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const Feedback = ({ pairingId, isParticipant, isEnded }) => {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterDirection, setFilterDirection] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('Pair only');

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(`/pairings/${pairingId}/feedback`, {
        params: {
          page,
          direction: filterDirection,
          sort: sortAsc ? 'asc' : 'desc'
        }
      });
      setFeedbackList(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [pairingId, page, filterDirection, sortAsc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/pairings/${pairingId}/feedback`, { body, visibility });
      toast.success('Feedback sent!');
      setIsModalOpen(false);
      setBody('');
      setVisibility('Pair only');
      setPage(1);
      fetchFeedback();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error submitting feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await axios.delete(`/pairings/${pairingId}/feedback/${id}`);
      toast.success('Feedback deleted');
      fetchFeedback();
    } catch (err) {
      toast.error('Error deleting feedback');
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-500 flex justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Feedback Exchange</h3>
          <p className="text-sm text-gray-500">Provide constructive feedback to your partner.</p>
        </div>
        {isParticipant && !isEnded && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all font-medium text-sm"
          >
            <Plus size={16} />
            <span>Give Feedback</span>
          </button>
        )}
      </div>

      {isParticipant && (
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 font-medium">Filter:</span>
            <select 
              value={filterDirection} 
              onChange={e => setFilterDirection(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Feedback</option>
              <option value="sent">Sent by me</option>
              <option value="received">Received by me</option>
            </select>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={sortAsc} 
              onChange={e => setSortAsc(e.target.checked)} 
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Oldest First</span>
          </label>
        </div>
      )}

      {feedbackList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No feedback exchanged yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map(f => {
            const isAuthor = f.from._id === user.id;
            return (
              <div 
                key={f._id} 
                className={`relative p-5 rounded-xl border shadow-sm transition-all ${isAuthor ? 'bg-blue-50/50 border-blue-100 ml-4 md:ml-12' : 'bg-white border-gray-100 mr-4 md:mr-12'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isAuthor ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                      {f.from.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 flex items-center space-x-1">
                        <span>{f.from.name}</span>
                        {isAuthor ? <ArrowRight size={12} className="text-gray-400" /> : <ArrowLeft size={12} className="text-gray-400" />}
                        <span className="text-gray-500 font-normal">{f.to.name}</span>
                      </p>
                      <p className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${f.visibility === 'Pair only' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {f.visibility}
                    </span>
                    {isAuthor && (
                      <button onClick={() => handleDelete(f._id)} className="text-red-400 hover:text-red-600 transition-colors bg-white p-1.5 rounded-full hover:bg-red-50 border border-transparent hover:border-red-100">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-white/60 p-4 rounded-lg text-gray-800 text-sm whitespace-pre-wrap border border-white">
                  {f.body}
                </div>
              </div>
            );
          })}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8 pt-4">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare size={20} className="text-blue-600" />
                <span>Give Feedback</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form id="feedback-form" onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 mb-2">
                <strong>Note:</strong> Feedback visibility is locked permanently once submitted.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select 
                  value={visibility} 
                  onChange={e => setVisibility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                >
                  <option value="Pair only">Pair only (Private to you and partner)</option>
                  <option value="Pair + Observers">Pair + Observers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
                <textarea 
                  required
                  placeholder="Share your thoughts..." 
                  value={body} 
                  onChange={e => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[120px]"
                />
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button form="feedback-form" type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
