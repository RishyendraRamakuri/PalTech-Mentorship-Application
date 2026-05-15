import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, X, Target, BarChart2, History, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const KRAs = ({ pairingId, isParticipant, isEnded }) => {
  const [kras, setKras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isKraModalOpen, setIsKraModalOpen] = useState(false);
  const [kraTitle, setKraTitle] = useState('');
  const [kraDesc, setKraDesc] = useState('');

  const [activeKraIdForKpi, setActiveKraIdForKpi] = useState(null);
  const [kpiTitle, setKpiTitle] = useState('');
  const [kpiTarget, setKpiTarget] = useState('');

  const [activeKpiUpdate, setActiveKpiUpdate] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updateStatus, setUpdateStatus] = useState('On track');
  const [updateNote, setUpdateNote] = useState('');

  const [kpiHistory, setKpiHistory] = useState({});

  const fetchKras = async () => {
    try {
      const res = await axios.get(`/pairings/${pairingId}/kras`);
      setKras(res.data);
    } catch (err) {
      toast.error('Failed to load KRAs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKras();
  }, [pairingId]);

  const handleCreateKRA = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/pairings/${pairingId}/kras`, { title: kraTitle, description: kraDesc });
      toast.success('KRA Defined!');
      setIsKraModalOpen(false);
      setKraTitle('');
      setKraDesc('');
      fetchKras();
    } catch (err) {
      toast.error('Error creating KRA');
    }
  };

  const handleCreateKPI = async (e, kraId) => {
    e.preventDefault();
    try {
      await axios.post(`/pairings/${pairingId}/kras/${kraId}/kpis`, { title: kpiTitle, targetValue: kpiTarget });
      toast.success('KPI Added!');
      setActiveKraIdForKpi(null);
      setKpiTitle('');
      setKpiTarget('');
      fetchKras();
    } catch (err) {
      toast.error('Error creating KPI');
    }
  };

  const fetchHistory = async (kpiId, page = 1) => {
    try {
      const res = await axios.get(`/pairings/${pairingId}/kpis/${kpiId}/updates`, { params: { page } });
      setKpiHistory(prev => ({
        ...prev,
        [kpiId]: {
          updates: res.data.data,
          page: res.data.page,
          totalPages: res.data.totalPages
        }
      }));
    } catch (err) {
      toast.error('Error loading history');
    }
  };

  const handleUpdateKPI = async (e, kpiId) => {
    e.preventDefault();
    try {
      await axios.post(`/pairings/${pairingId}/kpis/${kpiId}/updates`, {
        newValue: updateValue,
        newStatus: updateStatus,
        note: updateNote
      });
      toast.success('KPI Updated!');
      setActiveKpiUpdate(null);
      setUpdateValue('');
      setUpdateStatus('On track');
      setUpdateNote('');
      fetchKras();
      fetchHistory(kpiId, 1);
    } catch (err) {
      toast.error('Error updating KPI');
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-500 flex justify-center"><div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div></div>;

  const parseNumericValue = (value) => {
    if (value == null || value === '') return null;
    const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getKpiProgress = (kpi) => {
    const current = parseNumericValue(kpi.currentValue);
    const target = parseNumericValue(kpi.targetValue);
    if (current == null || target == null || target <= 0) {
      return { percent: 0, isComplete: false };
    }
    const percent = Math.min(100, Math.max(0, (current / target) * 100));
    return { percent, isComplete: current >= target };
  };

  const StatusIcon = ({ status }) => {
    if (status === 'On track') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'At risk') return <AlertTriangle size={16} className="text-yellow-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Key Result Areas</h3>
          <p className="text-sm text-gray-500">Define goals and track performance indicators.</p>
        </div>
        {isParticipant && !isEnded && (
          <button 
            onClick={() => setIsKraModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all font-medium text-sm"
          >
            <Target size={16} />
            <span>Define KRA</span>
          </button>
        )}
      </div>

      {kras.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Target size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No KRAs defined yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {kras.map(kra => (
            <div key={kra._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900">{kra.title}</h4>
                {kra.description && <p className="text-sm text-gray-500 mt-1">{kra.description}</p>}
              </div>

              <div className="p-6">
                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <BarChart2 size={16} /> <span>Performance Indicators</span>
                </h5>
                
                {kra.kpis && kra.kpis.length > 0 ? (
                  <div className="space-y-4">
                    {kra.kpis.map(kpi => {
                      const { percent, isComplete } = getKpiProgress(kpi);
                      return (
                      <div key={kpi._id} className={`border rounded-lg p-4 transition-all ${kpi.status === 'On track' ? 'border-green-100 bg-green-50/10' : kpi.status === 'At risk' ? 'border-yellow-100 bg-yellow-50/10' : 'border-red-100 bg-red-50/10'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <StatusIcon status={kpi.status} />
                              <strong className="text-gray-900">{kpi.title}</strong>
                            </div>
                            
                            {/* KPI Visual Bar */}
                            <div className="mt-3 bg-gray-100 rounded-full h-2 w-full max-w-md overflow-hidden">
                              {percent > 0 && (
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${percent}%` }}
                                />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="text-gray-500">Target: <strong className="text-gray-900">{kpi.targetValue}</strong></span>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-500">Current: <strong className="text-gray-900">{kpi.currentValue || 'N/A'}</strong></span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isParticipant && !isEnded && (
                              <button 
                                onClick={() => setActiveKpiUpdate(activeKpiUpdate === kpi._id ? null : kpi._id)} 
                                className="text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors"
                              >
                                Log Update
                              </button>
                            )}
                            <button 
                              onClick={() => { kpiHistory[kpi._id] ? setKpiHistory(prev => { const n = {...prev}; delete n[kpi._id]; return n; }) : fetchHistory(kpi._id) }} 
                              className={`text-xs font-medium border px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1 ${kpiHistory[kpi._id] ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                            >
                              <History size={12} />
                              <span>{kpiHistory[kpi._id] ? 'Hide History' : 'History'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Update Form */}
                        {activeKpiUpdate === kpi._id && (
                          <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <form onSubmit={(e) => handleUpdateKPI(e, kpi._id)} className="space-y-3">
                              <div className="flex gap-3">
                                <input required type="text" placeholder="New Current Value" value={updateValue} onChange={e => setUpdateValue(e.target.value)} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                                <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                                  <option value="On track">On track</option>
                                  <option value="At risk">At risk</option>
                                  <option value="Off track">Off track</option>
                                </select>
                              </div>
                              <input type="text" placeholder="Update Note (optional)" value={updateNote} onChange={e => setUpdateNote(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                              <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setActiveKpiUpdate(null)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                                <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Update</button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* History Log */}
                        {kpiHistory[kpi._id] && (
                          <div className="mt-4 bg-white/50 rounded-lg text-sm border border-gray-100">
                            {kpiHistory[kpi._id].updates.length === 0 ? <p className="p-3 text-gray-500 text-center">No updates logged yet.</p> : (
                              <div className="divide-y divide-gray-100">
                                {kpiHistory[kpi._id].updates.map(up => (
                                  <div key={up._id} className="p-3 hover:bg-white transition-colors">
                                    <div className="flex justify-between">
                                      <p className="text-gray-900">
                                        Changed to <strong>{up.newValue}</strong> 
                                        <span className={`ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${up.newStatus === 'On track' ? 'bg-green-100 text-green-700' : up.newStatus === 'At risk' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{up.newStatus}</span>
                                      </p>
                                      <span className="text-xs text-gray-400">{new Date(up.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {up.note && <p className="text-gray-600 mt-1 italic text-xs">"{up.note}"</p>}
                                    <p className="text-xs text-gray-400 mt-1">By {up.author?.name}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {kpiHistory[kpi._id].totalPages > 1 && (
                              <div className="flex justify-center items-center space-x-3 p-3 bg-gray-50/50 border-t border-gray-100 text-xs">
                                <button disabled={kpiHistory[kpi._id].page === 1} onClick={() => fetchHistory(kpi._id, kpiHistory[kpi._id].page - 1)} className="text-blue-600 disabled:text-gray-400 font-medium">Prev</button>
                                <span className="text-gray-500">{kpiHistory[kpi._id].page} / {kpiHistory[kpi._id].totalPages}</span>
                                <button disabled={kpiHistory[kpi._id].page >= kpiHistory[kpi._id].totalPages} onClick={() => fetchHistory(kpi._id, kpiHistory[kpi._id].page + 1)} className="text-blue-600 disabled:text-gray-400 font-medium">Next</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                ) : <p className="text-sm text-gray-500">No KPIs defined under this KRA.</p>}

                {isParticipant && !isEnded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {activeKraIdForKpi === kra._id ? (
                      <form onSubmit={(e) => handleCreateKPI(e, kra._id)} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h6 className="text-sm font-semibold text-gray-700 mb-3">Add New KPI</h6>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input required type="text" placeholder="KPI Title" value={kpiTitle} onChange={e => setKpiTitle(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                          <input required type="text" placeholder="Target Value" value={kpiTarget} onChange={e => setKpiTarget(e.target.value)} className="w-full sm:w-32 px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button type="submit" className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Save KPI</button>
                          <button type="button" onClick={() => setActiveKraIdForKpi(null)} className="px-4 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 font-medium">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => setActiveKraIdForKpi(kra._id)} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center space-x-1">
                        <Plus size={14} /> <span>Add KPI</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KRA Modal */}
      {isKraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Target size={20} className="text-blue-600" />
                <span>Define KRA</span>
              </h3>
              <button onClick={() => setIsKraModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form id="kra-form" onSubmit={handleCreateKRA} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KRA Title</label>
                <input 
                  required type="text" placeholder="E.g., Improve technical communication" 
                  value={kraTitle} onChange={e => setKraTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea 
                  placeholder="Details about this objective..." 
                  value={kraDesc} onChange={e => setKraDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[80px]"
                />
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3">
              <button type="button" onClick={() => setIsKraModalOpen(false)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button form="kra-form" type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
                Save KRA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KRAs;
