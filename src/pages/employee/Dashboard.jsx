import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { assignmentApi } from "../../api/assignment.api";
import { approvalApi } from "../../api/approval.api";
import { submissionApi } from "../../api/submission.api";
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  FileText,
  User,
  Layers,
  History,
  Sparkles,
  ArrowRight,
  PlusCircle,
  LayoutGrid
} from "lucide-react";
import StatCard from "../../components/analytics/StatCard";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingCount: 0, completedCount: 0 });
  const [tasks, setTasks] = useState([]);
  const [bulkTasks, setBulkTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes, bulkRes, submissionRes] = await Promise.all([
        assignmentApi.getTaskStats(),
        assignmentApi.getAssignedTasks(),
        approvalApi.getApprovalTasks("PENDING"),
        submissionApi.getSubmissions()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (bulkRes.success) setBulkTasks(bulkRes.data);
      if (submissionRes.success) setSubmissions(submissionRes.data);
      
      if (!statsRes.success || !tasksRes.success || !bulkRes.success || !submissionRes.success) {
        toast.error("Failed to load some dashboard data");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-spin border-t-indigo-600" />
          <Loader2 className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-slate-600 font-semibold text-sm">Preparing your workspace</p>
          <p className="text-slate-400 text-xs mt-1">Fetching latest data and assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
              <Sparkles className="w-4 h-4 fill-indigo-100" />
              <span>Personal Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Employee</h1>
            <p className="text-slate-500 text-sm">Monitor your tasks, approvals and recent permit activities here.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Active Status</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{stats.pendingCount + stats.completedCount} <span className="text-sm font-medium text-slate-400 ml-1">Total Tasks</span></p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Pending Permits" 
            value={stats.pendingCount} 
            icon={<Clock className="w-5 h-5" />} 
            color="amber"
            subtitle="Requires your attention"
          />
          <StatCard 
            title="Completed Permits" 
            value={stats.completedCount} 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            color="green"
            subtitle="Successfully processed"
          />
          <div 
            onClick={() => navigate('/employee/templates')}
            className="group relative overflow-hidden bg-indigo-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg shadow-indigo-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-1">Quick New Permit</h3>
                <p className="text-indigo-100 text-sm">Select a template and start a new submission instantly.</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold mt-6 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all">
                Browse Templates <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Approvals Section */}
        {bulkTasks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bundle Approvals</h2>
                  <p className="text-slate-500 text-xs">Multi-permit processing queues that require authorization</p>
                </div>
              </div>
              <div className="h-px flex-1 bg-slate-200 mx-8 hidden lg:block" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bulkTasks.map((bt) => (
                <div 
                  key={bt._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 leading-none">{bt.formIds?.length}</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Permits in bundle</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">Submitted By</p>
                        <p className="text-sm font-bold text-slate-700">{bt.submittedBy?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {bt.formIds?.slice(0, 3).map((f, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white text-[10px] font-semibold text-slate-500 rounded-lg border border-slate-200">
                          {f.formName?.length > 15 ? f.formName.substring(0, 15) + '...' : f.formName}
                        </span>
                      ))}
                      {bt.formIds?.length > 3 && (
                        <span className="px-2.5 py-1 bg-indigo-50 text-[10px] font-semibold text-indigo-600 rounded-lg border border-indigo-100">
                          +{bt.formIds.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/employee/bulk-approval/${bt._id}`)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-100 flex items-center justify-center gap-2 group/btn"
                  >
                    Review Bundle
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Assigned Tasks Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-purple-600">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Tasks</h2>
                <p className="text-slate-500 text-xs">Direct assignments awaiting your action</p>
              </div>
            </div>
            
            {tasks.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">No Active Assignments</h3>
                <p className="text-slate-500 text-sm">You've completed all your assigned tasks. Great job!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Form Template</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned By</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tasks.map((task) => (
                        <tr key={task._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-100">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {task.templateId?.templateName || task.templateId?.formName || "Untitled Form"}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                {task.assignedBy?.name?.charAt(0) || "S"}
                              </div>
                              <span className="text-sm font-medium text-slate-600">{task.assignedBy?.name || "System Admin"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate(`/employee/fill-assignment/${task._id}`)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Execute
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
                <p className="text-slate-500 text-xs">Tracking your latest submissions</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {submissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <LayoutGrid className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No recent activity found</p>
                  </div>
                ) : (
                  submissions.slice(0, 6).map((sub) => (
                    <div key={sub._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          sub.status === 'APPROVED' ? 'bg-emerald-400' :
                          sub.status === 'REJECTED' ? 'bg-rose-400' :
                          'bg-indigo-400'
                        }`} />
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                            {sub.templateName || "Untitled Form"}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          sub.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          sub.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                        <button className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {submissions.length > 0 && (
                <button className="w-full py-4 bg-slate-50/80 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-t border-slate-100 uppercase tracking-widest">
                  View Full History
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
