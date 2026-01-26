import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CustomPlanModal from "../components/modals/CustomPlanModal";
import { getAllPlans } from "../config/plans";
import { companyApi } from "../api/company.api";
import { plantApi } from "../api/plant.api";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, 
  Edit3, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Briefcase, 
  Hash,
  Home,
  Users,
  Grid3x3,
  Check,
  ToggleLeft,
  ToggleRight,
  Building2,
  Crown,
  Shield,
  Sparkles,
  TrendingUp,
  Activity
} from "lucide-react";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const PLANS = getAllPlans();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [plantOpen, setPlantOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [customLimits, setCustomLimits] = useState({
    maxPlants: 1,
    maxFormsPerPlant: 1,
    maxEmployeesPerPlant: 1,
    approvalLevels: 1
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [updatingTemplateFeature, setUpdatingTemplateFeature] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCompany();
  }, [id, token]);

  const fetchCompany = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await apiRequest(`/api/companies/${id}`, "GET", null, token);
      setCompany(data);
      const plan = data.subscription?.plan || "SILVER";
      setSelectedPlan(plan);
      if (plan === "CUSTOM" && data.subscription?.customLimits) {
        setCustomLimits(data.subscription.customLimits);
      }
    } catch (err) {
      setError(err?.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpdate = async () => {
    try {
      setUpdatingPlan(true);
      const payload = { 
        plan: selectedPlan,
        customLimits: selectedPlan === "CUSTOM" ? customLimits : undefined
      };
      await apiRequest(`/api/companies/${id}/plan`, "PUT", payload, token);
      await fetchCompany();
      setPlanModalOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to update plan");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleToggleCompanyTemplateFeature = async (enabled) => {
    try {
      setUpdatingTemplateFeature(true);
      const response = await companyApi.updateTemplateFeature(company._id, enabled);
      if (response.success) {
        toast.success(`Template feature ${enabled ? 'enabled' : 'disabled'} for company`);
        await fetchCompany();
      } else {
        toast.error(response.message || "Failed to update template feature");
      }
    } catch (err) {
      console.error("Toggle template feature error:", err);
      toast.error(err.response?.data?.message || "Failed to update template feature");
    } finally {
      setUpdatingTemplateFeature(false);
    }
  };

  const handleTogglePlantTemplateFeature = async (plantId, enabled) => {
    try {
      setUpdatingTemplateFeature(true);
      const response = await plantApi.updateTemplateFeature(plantId, enabled);
      if (response.success) {
        toast.success(`Template feature ${enabled ? 'enabled' : 'disabled'} for plant`);
        await fetchCompany();
      } else {
        toast.error(response.message || "Failed to update template feature");
      }
    } catch (err) {
      console.error("Toggle plant template feature error:", err);
      toast.error(err.response?.data?.message || "Failed to update template feature");
    } finally {
      setUpdatingTemplateFeature(false);
    }
  };

  const isTemplateFeatureEnabled = (plant) => {
    // If plant has explicit setting, use it; otherwise inherit from company
    if (plant.templateFeatureEnabled !== null && plant.templateFeatureEnabled !== undefined) {
      return plant.templateFeatureEnabled;
    }
    return company?.templateFeatureEnabled || false;
  };

  const getPlanIcon = (planKey) => {
    switch(planKey?.toUpperCase()) {
      case "GOLD": return "🥇";
      case "PREMIUM": return "💎";
      case "CUSTOM": return "✨";
      default: return "🥈";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3x3 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error || "Company not found"}</p>
          <button
            onClick={() => navigate("/super/companies")}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const logoUrl = company.logoUrl ? `${company.logoUrl}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      {/* Sticky Action Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm -mx-6 -mt-6 mb-8">
        <div className="max-w-full mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/super/companies")}
            className="flex items-center text-slate-600 hover:text-indigo-600 transition-all font-semibold gap-2.5 group"
          >
            <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition-all group-hover:shadow-sm">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm">Back to Directory</span>
          </button>
          
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/super/companies/${id}/edit`)}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-sm shadow-sm hover:shadow"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              <button
                onClick={() => navigate(`/super/companies/${id}/plants/add`)}
                className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                <Plus size={16} />
                New Plant
              </button>
            </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-2">
        {/* Company Hero Section */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          </div>
          <div className="px-8 pb-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative -mt-24">
                {logoUrl ? (
                  <div className="w-40 h-40 rounded-3xl border-4 border-white shadow-2xl shadow-slate-900/20 bg-white p-3 ring-1 ring-slate-100">
                    <img 
                      src={logoUrl} 
                      alt={company.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-3xl border-4 border-white shadow-2xl shadow-slate-900/20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-black ring-1 ring-slate-100">
                    {company.name?.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl shadow-lg flex items-center justify-center">
                  <Activity size={18} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider shadow-sm">
                    <Briefcase size={12} />
                    {company.industry || "Enterprise"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Active
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider shadow-sm">
                    <Crown size={12} />
                    {company.subscription?.plan || "Silver"}
                  </span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{company.name}</h1>
                <p className="text-slate-600 text-sm flex items-center gap-2 font-medium">
                  <MapPin size={16} className="text-slate-400" />
                  {company.address || "Headquarters Address Not Specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Key Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={14} />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-3xl font-black text-indigo-600 mb-1">{company.plants?.length || 0}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plants</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <div className="text-3xl font-black text-emerald-600 mb-1">{company.admins?.length || 0}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admins</div>
                </div>
              </div>
            </div>

            {/* Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Building2 size={14} />
                Company Details
              </h3>
              <div className="space-y-5">
                <DetailRow icon={<Hash size={18} className="text-indigo-500" />} label="GST Number" value={company.gstNumber} />
                <DetailRow icon={<User size={18} className="text-violet-500" />} label="Contact Phone" value={company.contactPhone} />
                <DetailRow icon={<Mail size={18} className="text-blue-500" />} label="Email Address" value={company.contactEmail} isEmail />
                <DetailRow icon={<MapPin size={18} className="text-rose-500" />} label="Official Address" value={company.address} isAddress />
              </div>
            </div>

            {/* Administrators */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} />
                  Admin Team
                </h3>
                <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                  {company.admins?.length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {company.admins?.length > 0 ? (
                  company.admins.map((admin) => (
                    <div key={admin._id} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all border border-transparent hover:border-indigo-100 hover:shadow-sm group">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:shadow-lg transition-shadow">
                        {admin.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{admin.name}</p>
                        <p className="text-xs text-slate-500 truncate">{admin.email}</p>
                      </div>
                      <Shield size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                    <Users className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-xs font-semibold text-slate-500">No administrators assigned</p>
                  </div>
                )}
              </div>
            </div>

            {/* Template Feature Toggle Card */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 p-6 text-white">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 pb-4 border-b border-white/20 flex items-center gap-2">
                <Sparkles size={14} />
                Template Feature
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div>
                    <p className="text-sm font-bold mb-1">Company-wide Setting</p>
                    <p className="text-xs text-white/80">
                      {company?.templateFeatureEnabled ? "Enabled for all plants" : "Disabled for all plants"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleCompanyTemplateFeature(!company?.templateFeatureEnabled)}
                    disabled={updatingTemplateFeature}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-violet-600 shadow-lg ${
                      company?.templateFeatureEnabled ? 'bg-white' : 'bg-white/30'
                    } ${updatingTemplateFeature ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full shadow-md transition-transform ${
                        company?.templateFeatureEnabled ? 'translate-x-7 bg-violet-600' : 'translate-x-1 bg-white'
                      }`}
                    />
                  </button>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-xs text-white/90 leading-relaxed">
                    When enabled, plant admins can create and manage templates. You can override this setting for individual plants.
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Plan Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-xl shadow-indigo-500/40 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-90 flex items-center gap-2">
                    <Crown size={14} />
                    Subscription Plan
                  </h3>
                  <button
                    onClick={() => setPlanModalOpen(true)}
                    className="text-xs font-black bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
                  >
                    Change Plan
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                    {getPlanIcon(company.subscription?.plan)}
                  </div>
                  <div>
                    <h4 className="text-3xl font-black capitalize mb-1">{company.subscription?.plan || "Silver"}</h4>
                    <p className="text-sm text-white/80 font-semibold">Manual Billing</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-inner">
                  {(() => {
                    if (company.subscription?.plan === "CUSTOM" && company.subscription?.customLimits) {
                      const cl = company.subscription.customLimits;
                      return (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-black mb-1">{cl.maxPlants}</div>
                            <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Plants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-black mb-1">{cl.maxFormsPerPlant}</div>
                            <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Forms/Plant</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-black mb-1">{cl.maxEmployeesPerPlant}</div>
                            <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Users/Plant</div>
                          </div>
                        </>
                      );
                    }
                    const plan = PLANS.find(p => p.key === (company.subscription?.plan?.toUpperCase() || "SILVER"));
                    return (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-black mb-1">{plan?.limits?.maxPlants === -1 ? "∞" : plan?.limits?.maxPlants}</div>
                          <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Plants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black mb-1">{plan?.limits?.maxFormsPerPlant === -1 ? "∞" : plan?.limits?.maxFormsPerPlant}</div>
                          <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Forms/Plant</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black mb-1">{plan?.limits?.maxEmployeesPerPlant === -1 ? "∞" : plan?.limits?.maxEmployeesPerPlant}</div>
                          <div className="text-[10px] uppercase opacity-80 font-bold tracking-wider">Users/Plant</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Plants & Operations */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 p-6">
              <div className="flex justify-between items-center mb-8 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Home size={14} />
                    Operational Plants
                  </h3>
                  <p className="text-xs text-slate-500">Manage physical locations and plant-specific settings</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-2">
                  <span className="text-lg font-black">{company.plants?.length || 0}</span>
                  <span className="opacity-80">Total</span>
                </div>
              </div>

              {company.plants?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {company.plants.map((plant) => (
                    <div 
                      key={plant._id} 
                      className="group relative p-6 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="relative">
                        <div className="flex justify-between items-start mb-5">
                          <div className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-lg">
                            <Home size={22} />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg shadow-sm group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                            {plant.code || "CODE-NA"}
                          </span>
                        </div>
                        
                        <h4 className="font-black text-slate-900 text-lg mb-2 group-hover:text-indigo-900 transition-colors">{plant.name}</h4>
                        <p className="text-xs text-slate-500 mb-5 line-clamp-1 flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          {plant.location || "No location specified"}
                        </p>
                        
                        {/* Template Feature Toggle */}
                        <div className="mb-5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-violet-500" />
                                Template Feature
                              </p>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                {isTemplateFeatureEnabled(plant) ? "Enabled" : "Disabled"}
                                {plant.templateFeatureEnabled === null && ` (Inherited)`}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePlantTemplateFeature(plant._id, !isTemplateFeatureEnabled(plant));
                              }}
                              disabled={updatingTemplateFeature || !company?.templateFeatureEnabled}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md ${
                                isTemplateFeatureEnabled(plant) ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
                              } ${(!company?.templateFeatureEnabled || updatingTemplateFeature) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                              title={!company?.templateFeatureEnabled ? "Enable template feature at company level first" : ""}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                                  isTemplateFeatureEnabled(plant) ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500"></span>
                            Active
                          </div>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg"># {plant.plantNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-indigo-50/20 rounded-2xl border-2 border-dashed border-slate-300">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-slate-200">
                    <Home className="text-slate-300" size={40} />
                  </div>
                    <h4 className="text-slate-900 font-black text-lg mb-2">No plants yet</h4>
                    <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">Start by adding your first operational facility to manage forms and employees</p>
                    <button 
                      onClick={() => navigate(`/super/companies/${id}/plants/add`)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                    >
                      <Plus size={18} />
                      Add First Plant
                    </button>
                  </div>

              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {editOpen && (
        <EditCompanyModal
          company={company}
          onClose={() => setEditOpen(false)}
          onSaved={fetchCompany}
        />
      )}

      {plantOpen && (
        <AddPlantModal
          companyId={company._id}
          onClose={() => setPlantOpen(false)}
          onSaved={fetchCompany}
        />
      )}

      {/* Plan Change Modal */}
      {planModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold">Change Subscription Plan</h2>
              <p className="text-white/80 text-sm mt-1">Select a new plan for {company.name}</p>
            </div>
            <div className="p-6 space-y-4">
              {PLANS.filter(p => p.key !== "CUSTOM").map((plan) => (
                <label
                  key={plan.key}
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.key
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.key}
                      checked={selectedPlan === plan.key}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.key ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                    }`}>
                      {selectedPlan === plan.key && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-2xl">{getPlanIcon(plan.key)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Popular</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{plan.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{plan.limits.maxPlants === -1 ? "∞" : plan.limits.maxPlants}</div>
                      <div className="text-slate-500">Plants</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{plan.limits.maxFormsPerPlant === -1 ? "∞" : plan.limits.maxFormsPerPlant}</div>
                      <div className="text-slate-500">Forms</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{plan.limits.maxEmployeesPerPlant === -1 ? "∞" : plan.limits.maxEmployeesPerPlant}</div>
                      <div className="text-slate-500">Employees</div>
                    </div>
                  </div>
                </label>
              ))}

              {/* Custom Plan Option */}
              <div className="pt-2">
                {selectedPlan === "CUSTOM" ? (
                  <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 shadow-sm animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span className="font-bold text-slate-900">Custom Plan</span>
                        <span className="text-[10px] uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Active</span>
                      </div>
                      <button 
                        onClick={() => setIsCustomModalOpen(true)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                      >
                        Edit Limits
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-white rounded-lg p-2 border border-indigo-100 shadow-sm">
                        <div className="font-bold text-slate-900">{customLimits.maxPlants}</div>
                        <div className="text-slate-500 uppercase">Plants</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-indigo-100 shadow-sm">
                        <div className="font-bold text-slate-900">{customLimits.maxFormsPerPlant}</div>
                        <div className="text-slate-500 uppercase">Forms</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-indigo-100 shadow-sm">
                        <div className="font-bold text-slate-900">{customLimits.maxEmployeesPerPlant}</div>
                        <div className="text-slate-500 uppercase">Users</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedPlan("CUSTOM");
                      setIsCustomModalOpen(true);
                    }}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-500 group-hover:text-indigo-600">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-bold">Customize Plan</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-center">Create tailored limits for this entity</p>
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setPlanModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlanUpdate}
                disabled={updatingPlan}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingPlan ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomPlanModal 
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        limits={customLimits}
        onSave={(newLimits) => {
          setCustomLimits(newLimits);
          setSelectedPlan("CUSTOM");
        }}
      />
    </div>
  );
}

function DetailRow({ icon, label, value, isEmail, isAddress }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="mt-0.5 p-2 bg-gradient-to-br from-slate-50 to-white rounded-xl group-hover:shadow-md transition-all">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-sm font-bold text-slate-900 ${
          isEmail ? 'text-blue-600 hover:text-blue-700 underline decoration-blue-200 decoration-2 cursor-pointer' : ''
        } ${
          isAddress ? 'leading-relaxed' : ''
        }`}>
          {value || <span className="text-slate-300 font-semibold italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}
