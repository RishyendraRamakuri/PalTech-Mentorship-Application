import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, X, Calendar as CalendarIcon, CheckSquare, Edit3, Trash2 } from 'lucide-react';

const OneOnOnes = ({ pairing, pairingId, isParticipant, isEnded }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  
  const [date, setDate] = useState('');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState('Pair only');
  const [actionItems, setActionItems] = useState([]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`/pairings/${pairingId}/1on1s`, {
        params: {
          page,
          openActionItems: filterOpen,
          sort: sortAsc ? 'asc' : 'desc'
        }
      });
      setSessions(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [pairingId, page, filterOpen, sortAsc]);

  const resetForm = () => {
    setEditingSessionId(null);
    setDate('');
    setAgenda('');
    setNotes('');
    setVisibility('Pair only');
    setActionItems([]);
    setIsModalOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session) => {
    setEditingSessionId(session._id);
    setDate(session.date.split('T')[0]); // format for input type="date"
    setAgenda(session.agenda || '');
    setNotes(session.notes || '');
    setVisibility(session.visibility || 'Pair only');
    
    // Map existing action items to state
    const mappedItems = (session.actionItems || []).map(item => ({
      _id: item._id, // Keep _id to update existing instead of creating new ones if API supports it, or just pass full objects
      description: item.description,
      status: item.status,
      owner: item.owner ? item.owner._id : ''
    }));
    setActionItems(mappedItems);
    
    setIsModalOpen(true);
  };

  const addActionItemField = () => {
    setActionItems([...actionItems, { description: '', status: 'Open', owner: pairing.mentee._id }]);
  };

  const updateActionItem = (index, field, value) => {
    const newItems = [...actionItems];
    newItems[index][field] = value;
    setActionItems(newItems);
  };

  const removeActionItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty action items
    const validActionItems = actionItems.filter(item => item.description.trim() !== '');

    const payload = { date, agenda, notes, visibility, actionItems: validActionItems };

    try {
      if (editingSessionId) {
        await axios.put(`/pairings/${pairingId}/1on1s/${editingSessionId}`, payload);
        toast.success('Session updated successfully!');
      } else {
        await axios.post(`/pairings/${pairingId}/1on1s`, payload);
        toast.success('Session logged successfully!');
        setPage(1);
      }
      resetForm();
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving 1:1 session');
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-500 flex justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Session History</h3>
          <p className="text-sm text-gray-500">Track meetings, agendas, and action items.</p>
        </div>
        {isParticipant && !isEnded && (
          <button 
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all font-medium text-sm"
          >
            <Plus size={16} />
            <span>Log New 1:1</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-6 text-sm">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={filterOpen} 
            onChange={e => setFilterOpen(e.target.checked)} 
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Open Action Items Only</span>
        </label>
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

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <CalendarIcon size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No 1:1 sessions logged yet.</p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {sessions.map(s => (
            <div key={s._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 z-10">
                <CalendarIcon size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow transition-shadow ml-14 md:ml-0 relative">
                
                {isParticipant && !isEnded && (
                  <button 
                    onClick={() => handleOpenEdit(s)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors bg-white hover:bg-blue-50 p-1.5 rounded-md border border-transparent hover:border-blue-100"
                    title="Edit Session"
                  >
                    <Edit3 size={16} />
                  </button>
                )}

                <div className="flex flex-col mb-3">
                  <h4 className="font-bold text-gray-900">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</h4>
                  <span className={`inline-block mt-1 w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.visibility === 'Pair only' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {s.visibility}
                  </span>
                </div>
                
                {s.agenda && (
                  <div className="mb-3 pr-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Agenda</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.agenda}</p>
                  </div>
                )}
                
                {s.notes && (
                  <div className="mb-4 pr-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.notes}</p>
                  </div>
                )}

                {s.actionItems && s.actionItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                      <CheckSquare size={12} /> <span>Action Items</span>
                    </p>
                    <ul className="space-y-2">
                      {s.actionItems.map(item => (
                        <li key={item._id} className="text-sm flex items-start space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${item.status === 'Done' ? 'bg-green-500' : item.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                          <div>
                            <p className={`font-medium ${item.status === 'Done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.description}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.status} &bull; Owner: {item.owner?.name || 'Unknown'}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <CalendarIcon size={20} className="text-blue-600" />
                <span>{editingSessionId ? 'Edit 1:1 Session' : 'Log 1:1 Session'}</span>
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="oneonone-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      required 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                    <select 
                      value={visibility} 
                      onChange={e => setVisibility(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                    >
                      <option value="Pair only">Pair only (Private)</option>
                      <option value="Pair + Observers">Pair + Observers</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
                  <textarea 
                    placeholder="What did you discuss?" 
                    value={agenda} 
                    onChange={e => setAgenda(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    placeholder="Meeting notes..." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[80px]"
                  />
                </div>

                {/* Action Items Section */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Action Items</label>
                    <button type="button" onClick={addActionItemField} className="text-xs text-blue-600 font-medium flex items-center space-x-1 hover:text-blue-800">
                      <Plus size={14} /> <span>Add Item</span>
                    </button>
                  </div>
                  
                  {actionItems.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No action items added.</p>
                  ) : (
                    <div className="space-y-3">
                      {actionItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <input 
                            type="text" 
                            placeholder="Description..." 
                            value={item.description} 
                            onChange={e => updateActionItem(idx, 'description', e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                            required
                          />
                          <div className="flex gap-2">
                            <select 
                              value={item.owner} 
                              onChange={e => updateActionItem(idx, 'owner', e.target.value)}
                              className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                            >
                              <option value={pairing.mentor._id}>Mentor</option>
                              <option value={pairing.mentee._id}>Mentee</option>
                            </select>
                            <select 
                              value={item.status} 
                              onChange={e => updateActionItem(idx, 'status', e.target.value)}
                              className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                            <button type="button" onClick={() => removeActionItem(idx)} className="text-red-400 hover:text-red-600 p-1.5 bg-white border border-gray-200 rounded-md">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3 shrink-0">
              <button type="button" onClick={resetForm} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button form="oneonone-form" type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
                {editingSessionId ? 'Save Changes' : 'Save Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneOnOnes;
