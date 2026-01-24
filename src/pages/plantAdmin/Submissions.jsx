import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission.api";
import { useAuth } from "../../context/AuthContext";
import { Eye, FileText, Search, Download, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";

function FolderSkeleton() {
  return (
    <div className="animate-pulse p-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
        <div className="h-5 w-12 bg-gray-100 rounded-full ml-auto" />
      </div>
    </div>
  );
}

export default function PlantAdminSubmissions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => { loadSubmissions(); }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getSubmissions();
      if (response.success) setSubmissions(response.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    const config = {
      APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approved" },
      PENDING_APPROVAL: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
      REJECTED: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
      DRAFT: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
      SUBMITTED: { bg: "bg-blue-50", text: "text-blue-700", label: "Submitted" },
    };
    const c = config[s] || config.PENDING_APPROVAL;
    return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', ' ·') : '—';

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      const formName = s.formName || s.templateId?.templateName || '';
      const submitter = s.submittedBy?.name || '';
      const matchesSearch = formName.toLowerCase().includes(searchQuery.toLowerCase()) || submitter.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || s.status?.toUpperCase() === statusFilter || (statusFilter === 'PENDING' && s.status?.toUpperCase() === 'PENDING_APPROVAL');
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  const groupedSubmissions = useMemo(() => {
    const groups = {};
    filteredSubmissions.forEach(sub => {
      const templateName = sub.formName || sub.templateId?.templateName || "Untitled Form";
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
          new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt)
        )
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [filteredSubmissions]);

  const toggleFolder = (folderKey) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderKey]: !prev[folderKey]
    }));
  };

  const handleRowClick = (id) => navigate(`/plant/submissions/${id}`);

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

  return (
    <div className="p-6 space-y-5 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-sm text-gray-500">Review and audit all form submissions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by form or submitter..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => <FolderSkeleton key={i} />)}
          </div>
        ) : groupedSubmissions.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 text-sm font-medium">No submissions found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groupedSubmissions.map((group) => {
              const isExpanded = expandedFolders[group.key];
              const statusCounts = getStatusSummary(group.submissions);
              
              return (
                <div key={group.key}>
                  <div
                    onClick={() => toggleFolder(group.key)}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isExpanded ? 'bg-indigo-100' : 'bg-amber-50'}`}>
                        {isExpanded ? (
                          <FolderOpen className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Folder className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{group.displayName}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        {statusCounts.pending > 0 && (
                          <span className="text-[10px] text-amber-600 font-medium">{statusCounts.pending} pending</span>
                        )}
                        {statusCounts.approved > 0 && (
                          <span className="text-[10px] text-emerald-600 font-medium">{statusCounts.approved} approved</span>
                        )}
                        {statusCounts.rejected > 0 && (
                          <span className="text-[10px] text-red-600 font-medium">{statusCounts.rejected} rejected</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        {group.submissions.length} {group.submissions.length === 1 ? 'submission' : 'submissions'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-gray-50/50 border-t border-gray-100">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-100/50">
                            <tr>
                              <th className="pl-14 pr-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Submission</th>
                              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Submitted By</th>
                              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Last Action</th>
                              <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">View</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.submissions.map((sub, idx) => (
                              <tr
                                key={sub._id}
                                onClick={() => handleRowClick(sub._id)}
                                className="border-b border-gray-100 last:border-b-0 hover:bg-white cursor-pointer group transition-colors"
                              >
                                <td className="pl-14 pr-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                                            Form {idx + 1}
                                          </span>
                                          {sub.formCode && (
                                            <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded border border-indigo-100 uppercase">
                                              {sub.formCode}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-gray-400">{formatDateTime(sub.submittedAt || sub.createdAt)}</p>
                                      </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase flex-shrink-0">
                                      {sub.submittedBy?.name?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-sm text-gray-600">{sub.submittedBy?.name || "Unknown"}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.submittedAt || sub.createdAt)}</td>
                                <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{sub.lastApprovedBy || sub.lastActionBy?.name || "—"}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRowClick(sub._id); }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  >
                                    <Eye size={15} />
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
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{groupedSubmissions.length} form template{groupedSubmissions.length !== 1 ? 's' : ''}</span>
        <span>{filteredSubmissions.length} total submission{filteredSubmissions.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
