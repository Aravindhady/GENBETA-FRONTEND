import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Search, 
  ClipboardList, 
  Eye, 
  ArrowLeft,
  Download,
  FileText,
  Folder
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import { exportToExcel, formatSubmissionsForExport } from "../../utils/excelExport";

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-gray-50">
      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-gray-100 rounded-lg" /><div className="h-3.5 w-28 bg-gray-100 rounded" /></div></td>
      <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-100 rounded-full" /><div className="h-3.5 w-20 bg-gray-100 rounded" /></div></td>
      <td className="px-5 py-4"><div className="h-3.5 w-16 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 bg-gray-100 rounded-full" /></td>
      <td className="px-5 py-4"><div className="h-3.5 w-16 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4 text-right"><div className="h-8 w-8 bg-gray-100 rounded-lg ml-auto" /></td>
    </tr>
  );
}

export default function TemplateSubmissions() {
  const navigate = useNavigate();
  const { templateName } = useParams();
  const decodedTemplateName = decodeURIComponent(templateName || "");
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [templateName]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await submissionApi.getSubmissions();
      const allSubs = res.success ? res.data : (res || []);
      
      const filtered = allSubs.filter(sub => {
        const subTemplateName = sub.formId?.formName || sub.templateName || "Untitled Form";
        return subTemplateName.toLowerCase().trim() === decodedTemplateName.toLowerCase().trim();
      });
      
      setSubmissions(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToExcel(formatSubmissionsForExport(filteredSubmissions), `${decodedTemplateName}_Submissions`, "Submissions");
  };

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === "APPROVED") return "bg-green-50 text-green-600";
    if (s === "REJECTED") return "bg-red-50 text-red-600";
    if (s === "SUBMITTED") return "bg-blue-50 text-blue-600";
    if (s === "PENDING_APPROVAL" || s === "IN_PROGRESS") return "bg-indigo-50 text-indigo-600";
    return "bg-gray-100 text-gray-600";
  };

  const getStatusLabel = (s) => {
    const st = s.status?.toUpperCase();
    if (st === "PENDING_APPROVAL" || st === "IN_PROGRESS") return `LVL ${s.currentLevel || 1} PENDING`;
    if (st === "APPROVED") return "APPROVED";
    return s.status?.replace(/_/g, " ")?.toUpperCase() || "UNKNOWN";
  };

  const getSubmitterName = (s) => {
    if (typeof s.submittedBy === "object") {
      return s.submittedBy?.name || s.submittedBy?.email || "Unknown";
    }
    return s.submittedBy || "Unknown";
  };

  const filteredSubmissions = submissions.filter(s => {
    const submitter = getSubmitterName(s);
    const id = s._id || "";
    return submitter.toLowerCase().includes(searchTerm.toLowerCase()) || 
           id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const statusCounts = {
    pending: filteredSubmissions.filter(s => !["APPROVED", "REJECTED"].includes(s.status?.toUpperCase())).length,
    approved: filteredSubmissions.filter(s => s.status?.toUpperCase() === "APPROVED").length,
    rejected: filteredSubmissions.filter(s => s.status?.toUpperCase() === "REJECTED").length
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <button
          onClick={() => navigate("/plant/submissions")}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shadow-sm">
            <Folder className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{decodedTemplateName}</h1>
            <p className="text-[15px] text-gray-500">All submissions for this form template</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredSubmissions.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-gray-400" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Submissions', value: filteredSubmissions.length, sub: 'For this template' },
          { label: 'Pending Review', value: statusCounts.pending, sub: 'Awaiting action' },
          { label: 'Completed', value: statusCounts.approved + statusCounts.rejected, sub: 'Approved or rejected' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-1">
            <p className="text-[13px] font-medium text-gray-500">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{loading ? '...' : stat.value}</span>
              <span className="text-[11px] text-gray-400">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="flex-1 w-full bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by submitter or ID..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statusCounts.pending > 0 && (
              <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[11px] font-medium rounded-lg border border-amber-100">
                {statusCounts.pending} Pending
              </span>
            )}
            {statusCounts.approved > 0 && (
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-lg border border-emerald-100">
                {statusCounts.approved} Approved
              </span>
            )}
            {statusCounts.rejected > 0 && (
              <span className="px-3 py-1.5 bg-red-50 text-red-700 text-[11px] font-medium rounded-lg border border-red-100">
                {statusCounts.rejected} Rejected
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Submission</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Submitted By</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Last Action</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
              </tbody>
            </table>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-gray-900">No submissions found</h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {searchTerm ? "Try adjusting your search." : "No submissions have been made for this template yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Submission</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Submitted By</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Last Action</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSubmissions.map((sub, idx) => (
                    <tr
                      key={sub._id}
                      onClick={() => navigate(`/plant/submissions/${sub._id}`)}
                      className="hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                            <FileText size={16} />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              Form Submission #{idx + 1}
                            </span>
                            <p className="text-[11px] text-gray-400 mt-0.5">ID: {sub._id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-semibold text-indigo-700 uppercase">
                            {getSubmitterName(sub).charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{getSubmitterName(sub)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">
                            {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(sub.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${getStatusColor(sub.status)}`}>
                          {getStatusLabel(sub)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">{sub.lastApprovedBy || "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-wide">
        <span>{filteredSubmissions.length} SUBMISSION{filteredSubmissions.length !== 1 ? 'S' : ''}</span>
        <button
          onClick={() => navigate("/plant/submissions")}
          className="text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Back to All Templates
        </button>
      </div>
    </div>
  );
}
