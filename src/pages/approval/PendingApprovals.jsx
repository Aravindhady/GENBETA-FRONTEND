import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { approvalApi } from '../../api/approval.api';
import { FileText, Clock, ChevronRight, AlertCircle, CheckCircle2, User, Eye, Check, X } from 'lucide-react';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

export default function PendingApprovals() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const result = await approvalApi.getAssignedSubmissions();
    if (result.success) {
      setSubmissions(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleQuickAction = async (e, submissionId, status) => {
    e.stopPropagation();
    
    const confirmMessage = status === 'approved' 
      ? "Are you sure you want to approve this submission?" 
      : "Are you sure you want to reject this submission?";
      
    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(submissionId);
      const result = await approvalApi.processApproval({
        submissionId,
        status,
        comments: `Quick ${status} from pending list`
      });

      if (result.success) {
        toast.success(`Submission ${status} successfully`);
        fetchSubmissions();
      } else {
        toast.error(result.message || `Failed to ${status} submission`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500">Manage and review forms assigned to you for approval.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
            <span className="text-sm font-semibold text-indigo-700">{submissions.filter(s => s.isMyTurn).length} Your Turn</span>
          </div>
          <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-sm font-semibold text-gray-600">{submissions.filter(s => !s.isMyTurn).length} Upcoming</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 font-medium">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">You don't have any forms waiting for your approval.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Form Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <tr 
                    key={sub._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`../approval/detail/${sub._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${sub.isMyTurn ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                                {sub.templateId?.formName || sub.formId?.formName || 'Untitled Form'}
                            </h3>
                            {sub.isMyTurn && (
                                <span className="px-2 py-0.5 bg-indigo-600 text-[10px] font-bold text-white uppercase rounded">
                                    Action Required
                                </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Level {sub.userLevel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-xs border border-gray-200">
                          {sub.submittedBy?.name?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{sub.submittedBy?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                            {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-400">
                            {new Date(sub.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.isMyTurn ? (
                        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold uppercase tracking-tight">Your Turn</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 text-gray-500 bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-tight">Upcoming</span>
                            </div>
                            {sub.pendingApproverName && (
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 ml-1">
                                    <User className="w-3 h-3" />
                                    <span>Waiting for {sub.pendingApproverName}</span>
                                </div>
                            )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`../approval/detail/${sub._id}`)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {sub.isMyTurn && (
                          <>
                            <button 
                              disabled={actionLoading === sub._id}
                              onClick={(e) => handleQuickAction(e, sub._id, 'approved')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Quick Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              disabled={actionLoading === sub._id}
                              onClick={(e) => handleQuickAction(e, sub._id, 'rejected')}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Quick Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {!sub.isMyTurn && (
                          <div className="p-2 text-gray-300" title="Waiting for previous level">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
