import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  ClipboardList, 
  Download, 
  Folder,
  ChevronRight
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import { exportToExcel, formatSubmissionsForExport } from "../../utils/excelExport";

function FolderSkeleton() {
  return (
    <div className="animate-pulse px-5 py-4 border-b border-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 w-44 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
        <div className="h-7 w-24 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export default function SubmissionsList() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { 
    fetchSubmissions(); 
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await submissionApi.getSubmissions();
      setSubmissions(res.success ? res.data : (res || []));
    } catch (err) { 
      console.error("Failed to fetch submissions", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleExport = () => { 
    exportToExcel(formatSubmissionsForExport(submissions), "Plant_Submissions", "Submissions"); 
  };

  const getSubmitterName = (s) => typeof s.submittedBy === "object" ? (s.submittedBy?.name || s.submittedBy?.email || "Unknown") : (s.submittedBy || "Unknown");

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const formName = s.formId?.formName || s.templateName || "";
      const submitter = getSubmitterName(s);
      return formName.toLowerCase().includes(searchTerm.toLowerCase()) || submitter.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [submissions, searchTerm]);

  const groupedSubmissions = useMemo(() => {
    const groups = {};
    filteredSubmissions.forEach(sub => {
      const templateName = sub.formId?.formName || sub.templateName || "Untitled Form";
      const normalizedName = templateName.toLowerCase().trim();
      
      if (!groups[normalizedName]) {
        groups[normalizedName] = {
          displayName: templateName,
          submissions: []
        };
      }
      groups[normalizedName].submissions.push(sub);
    });

    return Object.entries(groups)
      .map(([key, value]) => ({
        key,
        displayName: value.displayName,
        submissions: value.submissions.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [filteredSubmissions]);

  const getStatusSummary = (subs) => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    subs.forEach(s => {
      const status = s.status?.toUpperCase();
      if (status === 'APPROVED') counts.approved++;
      else if (status === 'REJECTED') counts.rejected++;
      else counts.pending++;
    });
    return counts;
  };

  const handleFolderClick = (templateName) => {
    navigate(`/plant/submissions/template/${encodeURIComponent(templateName)}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Form Submissions</h1>
          <p className="text-[15px] text-gray-500">Track and review all forms submitted to your plant.</p>
        </div>
        <button onClick={handleExport} disabled={submissions.length === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
          <Download className="w-4 h-4 text-gray-400" />
          Export All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Submissions', value: submissions.length, sub: 'All time' },
          { label: 'Form Templates', value: groupedSubmissions.length, sub: 'With submissions' },
          { label: 'Pending Review', value: submissions.filter(s => !["APPROVED", "REJECTED"].includes(s.status?.toUpperCase())).length, sub: 'Awaiting action' },
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
        <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search form templates..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div>{Array.from({ length: 5 }).map((_, i) => <FolderSkeleton key={i} />)}</div>
          ) : groupedSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-gray-900">No submissions found</h3>
              <p className="text-[13px] text-gray-500 mt-1">Submissions will appear here once forms are submitted.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {groupedSubmissions.map((group) => {
                const statusCounts = getStatusSummary(group.submissions);
                
                return (
                  <div
                    key={group.key}
                    onClick={() => handleFolderClick(group.displayName)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{group.displayName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {statusCounts.pending > 0 && (
                          <span className="text-[11px] text-amber-700 font-medium px-2 py-0.5 bg-amber-50 rounded">{statusCounts.pending} pending</span>
                        )}
                        {statusCounts.approved > 0 && (
                          <span className="text-[11px] text-emerald-700 font-medium px-2 py-0.5 bg-emerald-50 rounded">{statusCounts.approved} approved</span>
                        )}
                        {statusCounts.rejected > 0 && (
                          <span className="text-[11px] text-red-700 font-medium px-2 py-0.5 bg-red-50 rounded">{statusCounts.rejected} rejected</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-full">
                        {group.submissions.length} {group.submissions.length === 1 ? 'submission' : 'submissions'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
