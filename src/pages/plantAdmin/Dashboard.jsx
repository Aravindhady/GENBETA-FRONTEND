import { useState, useEffect } from "react";
import { FileText, ClipboardList, CheckCircle2, Send, Clock, Plus, Download, BarChart2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formApi } from "../../api/form.api";
import { submissionApi } from "../../api/submission.api";
import { assignmentApi } from "../../api/assignment.api";
import { analyticsApi } from "../../api/analytics.api";
import BarChart from "../../components/analytics/BarChart";
import PieChart from "../../components/analytics/PieChart";
import LineChart from "../../components/analytics/LineChart";
import StatCard from "../../components/analytics/StatCard";
import { exportToExcel, formatSubmissionsForExport } from "../../utils/excelExport";

function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
      <div className="space-y-2.5">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-7 w-14 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
      <div className="h-5 w-40 bg-gray-100 rounded mb-8" />
      <div className="h-48 bg-gray-50 rounded-2xl flex items-end justify-center gap-3 p-4">
        {[40, 65, 50, 80, 55].map((h, i) => (
          <div key={i} className="w-8 bg-gray-100 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function RecentSubmissionSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-50 rounded" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-3 w-24 bg-gray-50 rounded ml-auto" />
        <div className="h-5 w-16 bg-gray-100 rounded-full ml-auto" />
      </div>
    </div>
  );
}

export default function PlantAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalForms: 0, totalSubmissions: 0, recentApprovals: 0, pendingReview: 0, pendingAssignments: 0 });
  const [allSubmissions, setAllSubmissions] = useState([]);
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [chartData, setChartData] = useState({ statusDistribution: {}, submissionsPerForm: [], approvalsByEmployee: [], submissionsTrend: [], submissionsByUser: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '');
    };

    const fetchDashboardData = async () => {
      try {
        const [formsRes, submissionsRes, assignmentsRes, analyticsRes] = await Promise.all([
          formApi.getForms(), submissionApi.getSubmissions(), assignmentApi.getPlantAssignments(), analyticsApi.getDashboardAnalytics(30)
        ]);
        const forms = formsRes.success ? formsRes.data : (Array.isArray(formsRes) ? formsRes : []);
        const submissions = submissionsRes.success ? submissionsRes.data : (Array.isArray(submissionsRes) ? submissionsRes : []);
        const assignments = assignmentsRes.success ? assignmentsRes.data : (Array.isArray(assignmentsRes) ? assignmentsRes : []);
        const analytics = analyticsRes.success ? analyticsRes.data : (analyticsRes || {});
        setAllSubmissions(submissions);

        // Process Status Distribution
        const statusCounts = submissions.reduce((acc, s) => { const status = s.status?.toLowerCase() || 'pending'; acc[status] = (acc[status] || 0) + 1; return acc; }, {});
        
        // Process Submissions per Form
        const formCounts = submissions.reduce((acc, s) => { const formName = s.templateName || s.formId?.formName || "Unknown Form"; acc[formName] = (acc[formName] || 0) + 1; return acc; }, {});
        const barData = Object.entries(formCounts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);

        // Process Submissions Trend (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();
        const trendData = last7Days.map(date => ({
          date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          count: submissions.filter(s => s.createdAt.startsWith(date)).length
        }));

        // Process Submissions by User
        const userCounts = submissions.reduce((acc, s) => {
          const userName = typeof s.submittedBy === 'object' ? s.submittedBy?.name : s.submittedBy || "Unknown";
          acc[userName] = (acc[userName] || 0) + 1;
          return acc;
        }, {});
        const userBarData = Object.entries(userCounts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);

        setChartData({ 
          statusDistribution: statusCounts, 
          submissionsPerForm: barData, 
          approvalsByEmployee: (analytics?.approvalsByEmployee || []).map(a => ({ label: a.name || a.label, value: a.count || a.value })),
          submissionsTrend: trendData,
          submissionsByUser: userBarData
        });

        setStats({ totalForms: forms.length, totalSubmissions: submissions.length, recentApprovals: submissions.filter(s => s.status?.toLowerCase() === "approved").length, pendingReview: submissions.filter(s => s.status === "PENDING_APPROVAL" || s.status === "SUBMITTED").length, pendingAssignments: assignments.filter(a => a.status === "PENDING").length });
        setRecentSubmissions(submissions.slice(0, 10));
      } catch (err) { console.error("Failed to fetch dashboard data", err); } finally { setLoading(false); }
    };

  const handleExport = () => { if (allSubmissions.length === 0) return; exportToExcel(formatSubmissionsForExport(allSubmissions), `plant_submissions_report`, 'Submissions'); };

  const statCards = [
    { title: "Active Templates", value: stats.totalForms, icon: <FileText className="w-7 h-7" />, color: "blue" },
    { title: "Total Submissions", value: stats.totalSubmissions, icon: <ClipboardList className="w-7 h-7" />, color: "indigo" },
    { title: "Pending Review", value: stats.pendingReview, icon: <AlertCircle className="w-7 h-7" />, color: "amber" },
    { title: "My Assignments", value: stats.pendingAssignments, icon: <Clock className="w-7 h-7" />, color: "orange" },
  ];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Plant Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">
            Overview of <span className="text-indigo-600 font-bold">{user?.plantName || "Your Plant"}</span> operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-2xl font-bold border border-gray-200 transition-all shadow-sm">
            <Download className="w-5 h-5" /> Export Data
          </button>
          <Link to="/plant/forms/create" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1">
            <Plus className="w-5 h-5" /> Create New Form
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {loading ? Array.from({ length: 5 }).map((_, i) => <ChartSkeleton key={i} />) : (
          <>
            <div className="lg:col-span-3">
              <LineChart data={chartData.submissionsTrend} title="Submissions Trend" />
            </div>
            <div className="lg:col-span-1">
              <PieChart data={chartData.statusDistribution} title="Submission Status" />
            </div>
            <div className="lg:col-span-2">
              <BarChart data={chartData.submissionsPerForm} title="Most Submitted Forms" xLabel="Form Name" yLabel="Submissions" />
            </div>
            <div className="lg:col-span-2">
              <BarChart data={chartData.submissionsByUser} title="Top Contributors" xLabel="User" yLabel="Submissions" />
            </div>
            <div className="lg:col-span-1">
              <BarChart data={chartData.approvalsByEmployee} title="Approval Performance" xLabel="Employee" yLabel="Approvals" />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Submissions</h2>
              <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wider">Latest activity across all forms</p>
            </div>
            <Link to="/plant/submissions" className="text-sm font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors">View All Submissions</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 5 }).map((_, i) => <RecentSubmissionSkeleton key={i} />) : recentSubmissions.length > 0 ? recentSubmissions.map((s) => (
              <div key={s._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors shadow-sm"><FileText className="w-6 h-6 text-gray-400" /></div>
                  <div>
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{s.templateName || s.formId?.formName || "Unknown Form"}</p>
                    <p className="text-xs font-bold text-gray-500">{typeof s.submittedBy === 'object' ? s.submittedBy?.name : s.submittedBy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{formatDate(s.createdAt)}</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    s.status?.toLowerCase() === 'approved' ? 'bg-green-50 text-green-600' : 
                    s.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-600' : 
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    {s.status?.toUpperCase() === 'PENDING_APPROVAL' ? `LVL ${s.currentLevel || 1} PENDING` : s.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            )) : <div className="p-16 text-center text-gray-400 italic font-medium">No recent submissions found.</div>}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/plant/forms/create" className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                <div className="p-3 bg-indigo-50 group-hover:bg-white rounded-xl transition-colors shadow-sm"><Plus className="w-6 h-6 text-indigo-600" /></div>
                <div><p className="font-black text-sm text-gray-900">Create Template</p><p className="text-[11px] font-bold text-gray-400">Design a new form from scratch</p></div>
              </Link>
              <Link to="/plant/forms" className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group">
                <div className="p-3 bg-purple-50 group-hover:bg-white rounded-xl transition-colors shadow-sm"><FileText className="w-6 h-6 text-purple-600" /></div>
                <div><p className="font-black text-sm text-gray-900">Manage Forms</p><p className="text-[11px] font-bold text-gray-400">Edit and assign existing forms</p></div>
              </Link>
              <button onClick={handleExport} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group w-full text-left">
                <div className="p-3 bg-emerald-50 group-hover:bg-white rounded-xl transition-colors shadow-sm"><Download className="w-6 h-6 text-emerald-600" /></div>
                <div><p className="font-black text-sm text-gray-900">Generate Report</p><p className="text-[11px] font-bold text-gray-400">Download submission history</p></div>
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <BarChart2 className="w-10 h-10 mb-4 opacity-50" />
            <h3 className="text-lg font-black mb-2 tracking-tight">System Performance</h3>
            <p className="text-xs font-bold text-indigo-100 mb-4">Submission processing is currently running at peak efficiency.</p>
            <div className="h-1.5 w-full bg-indigo-500 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[94%]" />
            </div>
            <p className="text-[10px] font-black mt-2 uppercase tracking-widest text-indigo-200">94% Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
