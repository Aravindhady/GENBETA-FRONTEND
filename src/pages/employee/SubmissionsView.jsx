import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  FileText, 
  ChevronRight, 
  Clock, 
  User,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock3,
  Inbox,
  Loader2,
  Filter,
  ExternalLink
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function SubmissionsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await submissionApi.getSubmissions();
      if (res.success) {
        setSubmissions(res.data || []);
      } else {
        setSubmissions(res || []);
      }
    } catch (err) {
      console.error("Failed to fetch submissions", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const formName = (s.templateId?.formName || s.templateId?.templateName || s.formId?.formName || s.templateName || "").toLowerCase();
    const matchesSearch = formName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status?.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "SUBMITTED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PENDING_APPROVAL":
      case "IN_PROGRESS": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case "APPROVED": return <CheckCircle className="w-3.5 h-3.5" />;
      case "REJECTED": return <XCircle className="w-3.5 h-3.5" />;
      case "PENDING_APPROVAL":
      case "IN_PROGRESS": return <Clock3 className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions View</h1>
          <p className="text-gray-500 text-sm">View and track the status of all your submitted forms.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by form name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING_APPROVAL">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Form Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Submitted Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Approvals</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Inbox className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No submissions found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchTerm || statusFilter !== "ALL" ? "Try adjusting your filters" : "You haven't submitted any forms yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {submission.formId?.formName || submission.templateName || "Untitled Form"}
                          </div>
                          <div className="text-[11px] text-gray-400 uppercase">ID: {submission._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 font-medium">
                          {new Date(submission.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(submission.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(3, submission.approvalHistory?.length || 0))].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                              <User className="w-3 h-3 text-indigo-600" />
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {submission.approvalHistory?.length || 0} Levels
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/employee/submissions/${submission._id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group/btn"
                      >
                        View Details
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
