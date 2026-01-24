import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CustomPlanModal from "../components/modals/CustomPlanModal";
import EditPlantModal from "../components/modals/EditPlantModal";
import { toast } from "react-hot-toast";
import { getAllPlans } from "../config/plans";
import { 
  FiArrowLeft, FiEdit3, FiPlus, FiMail, FiPhone, FiMapPin, 
  FiUser, FiHash, FiHome, FiUsers, FiCheck, FiMoreVertical,
  FiActivity, FiPackage, FiGlobe, FiTrash2, FiEye
} from "react-icons/fi";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const PLANS = getAllPlans();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [customLimits, setCustomLimits] = useState({
    maxPlants: 1, maxFormsPerPlant: 1, maxEmployeesPerPlant: 1, approvalLevels: 1
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [error, setError] = useState("");
  const [editingPlant, setEditingPlant] = useState(null);

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchCompany();
  }, [id, token]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/companies/${id}`, "GET", null, token);
      setCompany(data);
      setSelectedPlan(data.subscription?.plan || "SILVER");
      if (data.subscription?.plan === "CUSTOM") setCustomLimits(data.subscription.customLimits);
    } catch (err) {
      setError(err?.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = async (plantId) => {
    if (!window.confirm("Are you sure you want to delete this plant? This action cannot be undone.")) return;
    
    const toastId = toast.loading("Deleting plant...");
    try {
      await apiRequest(`/api/plants/${plantId}`, "DELETE", null, token);
      toast.success("Plant deleted successfully", { id: toastId });
      fetchCompany();
    } catch (err) {
      toast.error(err?.message || "Failed to delete plant", { id: toastId });
    }
  };

  const handlePlanUpdate = async () => {
    try {
      setUpdatingPlan(true);
      await apiRequest(`/api/companies/${id}/plan`, "PUT", { 
        plan: selectedPlan, 
        customLimits: selectedPlan === "CUSTOM" ? customLimits : undefined 
      }, token);
      await fetchCompany();
      setPlanModalOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to update plan");
    } finally {
      setUpdatingPlan(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const getPlanStyles = (plan) => {
    const plans = {
      GOLD: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🥇' },
      PREMIUM: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '💎' },
      CUSTOM: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '✨' },
      SILVER: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '🥈' }
    };
    return plans[plan?.toUpperCase()] || plans.SILVER;
  };

  const planStyle = getPlanStyles(company?.subscription?.plan);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/super/companies")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{company.name}</h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <FiGlobe size={12} /> {company.industry || "General Enterprise"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/super/companies/${id}/edit`)} className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
              <FiEdit3 size={16} /> Edit
            </button>
            <button onClick={() => navigate(`/super/companies/${id}/plants/add`)} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
              <FiPlus size={16} /> Add Plant
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl border-l border-b ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}>
              {planStyle.icon} {company.subscription?.plan || "SILVER"}
            </div>
            <div className="flex flex-col items-center text-center pt-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} className="w-24 h-24 rounded-2xl object-contain bg-white border border-slate-100 p-2 shadow-sm mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                  {company.name.charAt(0)}
                </div>
              )}
              <h2 className="text-xl font-bold text-slate-900 mb-1">{company.name}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 justify-center">
                <FiMapPin size={14} /> {company.address || "No address"}
              </p>
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t border-slate-50">
              <DetailItem icon={<FiHash />} label="GSTIN" value={company.gstNumber} />
              <DetailItem icon={<FiMail />} label="Email" value={company.contactEmail} />
              <DetailItem icon={<FiPhone />} label="Phone" value={company.contactPhone} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <FiUsers className="text-indigo-600" /> Admin Team
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{company.admins?.length || 0}</span>
            </div>
            <div className="space-y-3">
              {company.admins?.map(admin => (
                <div key={admin._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 hover:border-slate-200 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">{admin.name.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{admin.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{admin.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-6 shadow-sm ${planStyle.bg} ${planStyle.border}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${planStyle.text}`}>Plan Quotas</h3>
              <button onClick={() => setPlanModalOpen(true)} className={`text-[10px] font-bold px-3 py-1 rounded-lg border bg-white ${planStyle.border} ${planStyle.text} hover:shadow-sm transition-all`}>Change</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <QuotaBox label="Plants" value={getLimitValue(company, "maxPlants", PLANS)} />
              <QuotaBox label="Users" value={getLimitValue(company, "maxEmployeesPerPlant", PLANS)} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <StatCard icon={<FiHome />} label="Total Plants" value={company.plants?.length || 0} color="indigo" />
            <StatCard icon={<FiPackage />} label="Total Forms" value={company.totalForms || 0} color="purple" />
            <StatCard icon={<FiActivity />} label="Health" value="Active" color="emerald" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Operational Plants</h3>
              <span className="text-xs text-slate-500">{company.plants?.length || 0} plants registered</span>
            </div>
            <div className="p-0">
              {company.plants?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plant Details</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Code</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {company.plants.map(plant => (
                        <tr key={plant._id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-lg transition-colors">
                                <FiHome size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{plant.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">ID: {plant._id.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                                {plant.code}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <FiMapPin size={12} className="text-slate-400" />
                              {plant.location}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              ACTIVE
                            </div>
                          </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingPlant(plant); }}
                                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200"
                                  title="Edit Plant"
                                >
                                  <FiEdit3 size={16} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeletePlant(plant._id); }}
                                  className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-slate-200"
                                  title="Delete Plant"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FiHome size={40} className="mx-auto text-slate-300 mb-4" />
                  <h4 className="font-bold text-slate-900">No Plants Found</h4>
                  <p className="text-sm text-slate-500 mt-1 mb-6">Start by adding a plant to this company.</p>
                  <button onClick={() => navigate(`/super/companies/${id}/plants/add`)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-100 transition-all">Add First Plant</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Modal */}
      {planModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white relative">
              <button onClick={() => setPlanModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-lg transition-colors">
                <FiPlus className="rotate-45" size={24} />
              </button>
              <h2 className="text-2xl font-bold">Subscription Plan</h2>
              <p className="text-white/70 text-sm mt-1">Scale {company.name}'s capabilities</p>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {PLANS.filter(p => p.key !== "CUSTOM").map(plan => (
                <label key={plan.key} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === plan.key ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input type="radio" name="plan" value={plan.key} checked={selectedPlan === plan.key} onChange={e => setSelectedPlan(e.target.value)} className="sr-only" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.key ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                    {selectedPlan === plan.key && <FiCheck className="text-white" size={14} />}
                  </div>
                  <div className="text-2xl">{getPlanStyles(plan.key).icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{plan.name}</span>
                      {plan.popular && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black">POPULAR</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                      {plan.limits.maxPlants === -1 ? 'Unlimited' : plan.limits.maxPlants} Plants • {plan.limits.maxEmployeesPerPlant === -1 ? 'Unlimited' : plan.limits.maxEmployeesPerPlant} Users
                    </p>
                  </div>
                </label>
              ))}
              
              <button onClick={() => { setSelectedPlan("CUSTOM"); setIsCustomModalOpen(true); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all ${selectedPlan === 'CUSTOM' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="text-2xl">✨</div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900">Custom Infrastructure</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tailored limits for unique enterprise needs</p>
                </div>
                {selectedPlan === 'CUSTOM' && <FiCheck className="text-indigo-600" />}
              </button>
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
              <button onClick={() => setPlanModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={handlePlanUpdate} disabled={updatingPlan} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
                {updatingPlan ? "Processing..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}

        <CustomPlanModal isOpen={isCustomModalOpen} onClose={() => setIsCustomModalOpen(false)} limits={customLimits} onSave={newLimits => { setCustomLimits(newLimits); setSelectedPlan("CUSTOM"); }} />
        
        {editingPlant && (
          <EditPlantModal 
            plant={editingPlant} 
            onClose={() => setEditingPlant(null)} 
            onSaved={fetchCompany} 
          />
        )}
      </div>
    );
  }

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function QuotaBox({ label, value }) {
  return (
    <div className="bg-white/60 rounded-xl p-3 border border-white/20">
      <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 ${colors[color]} border rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function getLimitValue(company, key, PLANS) {
  if (company.subscription?.plan === "CUSTOM") return company.subscription.customLimits[key];
  const plan = PLANS.find(p => p.key === (company.subscription?.plan?.toUpperCase() || "SILVER"));
  const val = plan?.limits?.[key];
  return val === -1 ? "∞" : val;
}
