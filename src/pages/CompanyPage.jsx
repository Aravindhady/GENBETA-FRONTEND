import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Download,
  ExternalLink,
  Users,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  MoreHorizontal,
  Globe,
  Briefcase,
  Layers,
  ChevronRight
} from "lucide-react";
import { DeleteCompanyModal } from "../components/companies/DeleteCompanyModal";

export default function CompanyPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/companies", "GET", null, token);
      setCompanies(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/companies/${deletingCompany.id}`, "DELETE", null, token);
      toast.success("Company deleted");
      setIsDeleteModalOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error("Failed to delete company");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter(c => c.status !== 'INACTIVE').length;
    const premium = companies.filter(c => ['GOLD', 'PREMIUM'].includes(c.subscription?.plan)).length;
    const totalPlants = companies.reduce((acc, c) => acc + (c.plantsCount || 0), 0);
    
    return [
      { label: "Total Companies", value: total, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Premium Clients", value: premium, icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50" },
      { label: "Total Plants", value: totalPlants, icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Active Forms", value: companies.reduce((acc, c) => acc + (c.formsCount || 0), 0), icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
    ];
  }, [companies]);

  const handleExport = () => {
    const headers = ["Name", "Industry", "Admin", "Plants", "Forms", "Plan"];
    const csvContent = [
      headers.join(","),
      ...filteredCompanies.map(c => [
        c.name, c.industry, c.adminEmail, c.plantsCount, c.formsCount, c.subscription?.plan || "SILVER"
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "companies.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500">Loading your ecosystem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Management</h1>
          <p className="text-slate-500 text-sm mt-1">Oversee and manage your SaaS client organizations</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={16} />
            Export Data
          </button>
          <Link 
            to="/super/companies/create" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
          >
            <Plus size={18} />
            Add Company
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <ArrowUpRight size={12} />
                Active
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by company name, industry or admin..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredCompanies.length} Companies Total
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Primary Admin</th>
                <th className="px-6 py-4">Industry & Status</th>
                <th className="px-6 py-4 text-center">Infrastructure</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map(company => (
                  <tr key={company.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="text-slate-400" size={24} />
                          )}
                        </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {company.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              ID: {company.id.slice(-6).toUpperCase()}
                            </div>
                            {company.website && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Globe size={12} className="text-slate-400" />
                                <span className="text-xs text-slate-500 truncate max-w-[150px]">
                                  {company.website}
                                </span>
                              </div>
                            )}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">{company.adminName}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{company.adminEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md w-fit">
                          <Briefcase size={12} />
                          {company.industry || 'General'}
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          Active Account
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-4 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-900">{company.plantsCount}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Plants</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-900">{company.formsCount}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Forms</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm ${
                        company.subscription?.plan === 'GOLD' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        company.subscription?.plan === 'PREMIUM' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 
                        'bg-slate-50 border-slate-100 text-slate-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          company.subscription?.plan === 'GOLD' ? 'bg-amber-500' :
                          company.subscription?.plan === 'PREMIUM' ? 'bg-indigo-500' : 'bg-slate-400'
                        }`}></div>
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {company.subscription?.plan || 'SILVER'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => navigate(`/super/companies/${company.id}`)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/super/companies/${company.id}/edit`)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit Settings"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => { setDeletingCompany(company); setIsDeleteModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Company"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Search size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">No companies found matching your search</p>
                      <button 
                        onClick={() => setSearchTerm("")}
                        className="text-indigo-600 text-sm font-bold hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination/Footer */}
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="text-slate-900 font-bold">{filteredCompanies.length}</span> of <span className="text-slate-900 font-bold">{companies.length}</span> companies
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">Previous</button>
            <button disabled className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-sm shadow-indigo-100">1</button>
            <button disabled className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

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
