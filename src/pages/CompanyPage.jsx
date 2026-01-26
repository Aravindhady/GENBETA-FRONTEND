import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  MapPin, 
  Users, 
  Layout,
  ChevronRight,
  Download,
  MoreVertical,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Globe
} from "lucide-react";

// Components
import { DeleteCompanyModal } from "../components/companies/DeleteCompanyModal";

const getPlanBadge = (plan) => {
  const planKey = plan?.toUpperCase() || "SILVER";
  switch(planKey) {
    case "GOLD":
      return { icon: "🥇", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
    case "PREMIUM":
      return { icon: "💎", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" };
    default:
      return { icon: "🥈", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
  }
};

export default function CompanyPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  
  // Delete State
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCompanies();
    // eslint-disable-next-line
  }, [token]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/api/companies", "GET", null, token);
      setCompanies(data.data || data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load companies";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (company) => {
    navigate(`/super/companies/${company._id || company.id}/edit`);
  };

  const handleDeleteClick = (company) => {
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCompany = async () => {
    setDeleteLoading(true);
    const toastId = toast.loading("Deleting company...");
    try {
      await apiRequest(
        `/api/companies/${deletingCompany._id || deletingCompany.id}`,
        "DELETE",
        null,
        token
      );
      toast.success("Company deleted successfully", { id: toastId });
      setIsDeleteModalOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(err?.response?.data?.message || "Failed to delete company", { id: toastId });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredCompanies.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    toast.success("Exporting data...");

    const headers = ["Company Name", "Industry", "Admin Name", "Admin Email", "Plants", "Forms", "Plan", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredCompanies.map(company => [
        `"${(company.name || "").replace(/"/g, '""')}"`,
        `"${(company.industry || "").replace(/"/g, '""')}"`,
        `"${(company.adminName || "").replace(/"/g, '""')}"`,
        `"${(company.adminEmail || "").replace(/"/g, '""')}"`,
        company.plantsCount || 0,
        company.formsCount || 0,
        `"${(company.subscription?.plan || "Silver").replace(/"/g, '""')}"`,
        "Active"
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `companies_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = 
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.adminName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlan = planFilter === "all" || 
        company.subscription?.plan?.toLowerCase() === planFilter.toLowerCase();
      
      return matchesSearch && matchesPlan;
    });
  }, [companies, searchTerm, planFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: companies.length,
      gold: companies.filter(c => c.subscription?.plan?.toUpperCase() === "GOLD").length,
      premium: companies.filter(c => c.subscription?.plan?.toUpperCase() === "PREMIUM").length,
      silver: companies.filter(c => c.subscription?.plan?.toUpperCase() === "SILVER" || !c.subscription?.plan).length
    };
  }, [companies]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/10">
      {/* Compact Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">Companies</h1>
                <p className="text-xs text-slate-500 font-medium">Manage all client companies</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-sm font-semibold shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <Link
                to="/super/companies/create"
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </Link>
            </div>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-gradient-to-br from-white to-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                  <p className="text-xl font-black text-slate-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-amber-50/30 p-3 rounded-xl border border-amber-100/50 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gold</p>
                  <p className="text-xl font-black text-slate-900">{stats.gold}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-purple-50/30 p-3 rounded-xl border border-purple-100/50 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium</p>
                  <p className="text-xl font-black text-slate-900">{stats.premium}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Silver</p>
                  <p className="text-xl font-black text-slate-900">{stats.silver}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-6 py-6">
        
        {/* Compact Filters */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select 
                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 cursor-pointer pr-6"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="text-xs font-bold text-slate-500 border-l border-slate-200 pl-3">
              <span className="text-indigo-600">{filteredCompanies.length}</span> results
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <div className="p-1 bg-red-100 rounded-full">
              <Trash2 className="w-4 h-4" />
            </div>
            {error}
          </div>
        )}

        {/* Compact Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
              <p className="text-slate-500 font-medium text-sm">Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No companies found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                {searchTerm || planFilter !== "all" 
                  ? "Try adjusting your filters"
                  : "Get started by adding your first company"}
              </p>
              {(searchTerm || planFilter !== "all") && (
                <button 
                  onClick={() => { setSearchTerm(""); setPlanFilter("all"); }}
                  className="mt-3 text-indigo-600 font-bold hover:underline text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Admin</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Stats</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map((company) => {
                    const planStyle = getPlanBadge(company.subscription?.plan);
                    return (
                      <tr 
                        key={company._id || company.id}
                        className="hover:bg-indigo-50/50 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/super/companies/${company._id || company.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm group-hover:border-indigo-300 transition-colors flex-shrink-0">
                              {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                              ) : (
                                <Building2 className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {company.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-500 font-medium truncate">{company.industry || "General"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-800 truncate">{company.adminName || "No Admin"}</span>
                            <span className="text-xs text-slate-500 font-medium truncate">{company.adminEmail || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-black text-slate-900">{company.plantsCount || 0}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Plants</div>
                            </div>
                            <div className="h-6 w-px bg-slate-200"></div>
                            <div className="text-center">
                              <div className="text-sm font-black text-slate-900">{company.formsCount || 0}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Forms</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black w-fit border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
                              <span>{planStyle.icon}</span>
                              {company.subscription?.plan || "Silver"}
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/super/companies/${company._id || company.id}`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(company);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(company);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Compact Footer */}
        {filteredCompanies.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
            <p>Showing <span className="font-bold text-slate-900">{filteredCompanies.length}</span> of <span className="font-bold text-slate-900">{filteredCompanies.length}</span> entries</p>
            <div className="flex items-center gap-1.5">
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors" disabled>Previous</button>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors" disabled>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DeleteCompanyModal 
        isOpen={isDeleteModalOpen}
        company={deletingCompany}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCompany}
        loading={deleteLoading}
      />
    </div>
  );
}
