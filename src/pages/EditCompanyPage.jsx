import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiUpload, FiX, FiArrowLeft, FiSave, FiCheck, FiInfo, FiGlobe, FiPhone, FiMail, FiMapPin, FiBriefcase, FiShield } from "react-icons/fi";
import { Building2, LayoutPanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FormInput = ({ label, icon: Icon, value, onChange, placeholder, type = "text", error }) => (
  <div className="space-y-1.5">
    <label className="text-[13px] font-semibold text-slate-600 ml-1 flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {label}
    </label>
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 group-hover:border-slate-300 focus:ring-indigo-50'} rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-900 shadow-sm`}
      />
    </div>
    {error && <p className="text-[11px] font-medium text-red-500 ml-1">{error}</p>}
  </div>
);

const Card = ({ title, icon: Icon, children, description }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
  >
    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">{title}</h3>
          {description && <p className="text-[11px] text-slate-500 font-medium">{description}</p>}
        </div>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

export default function EditCompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    contactEmail: "",
    contactPhone: "",
    gstNumber: "",
    address: "",
    isTemplateManagementEnabled: true,
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setFetching(true);
        const company = await apiRequest(`/api/companies/${id}`, "GET", null, token);
        setForm({
          name: company.name || "",
          industry: company.industry || "",
          contactEmail: company.contactEmail || "",
          contactPhone: company.contactPhone || "",
          gstNumber: company.gstNumber || "",
          address: company.address || "",
          isTemplateManagementEnabled: company.isTemplateManagementEnabled !== undefined ? company.isTemplateManagementEnabled : true,
        });
        if (company.logoUrl) {
          setLogoPreview(company.logoUrl);
        }
      } catch (err) {
        console.error("Failed to fetch company", err);
        toast.error("Failed to load company details");
        navigate("/super/companies");
      } finally {
        setFetching(false);
      }
    };

    if (token && id) {
      fetchCompany();
    }
  }, [id, token, navigate]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo size must be less than 2MB");
        return;
      }
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const save = async () => {
    const toastId = toast.loading("Saving company profile...");
    try {
      setLoading(true);
      const formData = new FormData();
      
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      if (logo) {
        formData.append("logo", logo);
      }

      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update company");
      }

        toast.success("Changes saved successfully", { id: toastId });
        navigate(`/super/companies/${id}`);
      } catch (err) {
      toast.error(err.message || "Failed to update company", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <p className="mt-4 text-slate-500 font-bold tracking-tight">Syncing data...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/super/companies/${id}`)}
                className="group p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
              <FiArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Companies</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Edit Profile</span>
              </div>
              <h1 className="text-sm font-black text-slate-900 truncate max-w-[200px] sm:max-w-md">
                {form.name}
              </h1>
            </div>
          </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate(`/super/companies/${id}`)}
                className="hidden sm:block px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
              >
                Discard
              </button>
            <button
              onClick={save}
              disabled={loading}
              className="relative group px-5 sm:px-7 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:shadow-indigo-100 transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="saving"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="save"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Core Identity */}
          <div className="lg:col-span-4 space-y-6">
            <Card title="Identity" icon={Building2} description="Company branding and visuals">
              <div className="space-y-6">
                <div className="relative flex flex-col items-center">
                  <div className="relative group w-40 h-40">
                    <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl blur-2xl group-hover:bg-indigo-600/10 transition-all"></div>
                    <div className="relative w-full h-full bg-white rounded-3xl border-2 border-dashed border-slate-200 group-hover:border-indigo-400 flex items-center justify-center overflow-hidden transition-all shadow-sm">
                      {logoPreview ? (
                        <div className="relative w-full h-full p-4">
                          <img 
                            src={logoPreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <button 
                              onClick={removeLogo}
                              className="p-2 bg-red-500 text-white rounded-xl shadow-xl hover:bg-red-600 transition-all transform hover:scale-110"
                            >
                              <FiX size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-600 transition-colors"
                        >
                          <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                            <FiUpload size={32} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest">Add Logo</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <p className="mt-4 text-[11px] text-slate-400 text-center font-medium max-w-[200px]">
                    Recommendation: High resolution PNG or SVG with transparent background
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <FormInput
                    label="Company Name"
                    icon={Building2}
                    value={form.name}
                    onChange={v => setForm({ ...form, name: v })}
                    placeholder="Global Industries Ltd."
                  />
                  <FormInput
                    label="Industry Sector"
                    icon={FiBriefcase}
                    value={form.industry}
                    onChange={v => setForm({ ...form, industry: v })}
                    placeholder="e.g. Energy, Manufacturing"
                  />
                </div>
              </div>
            </Card>

            <Card title="Features" icon={LayoutPanelLeft} description="Product specific capabilities">
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                <div className="mt-1 p-2 bg-white rounded-lg border border-indigo-100 shadow-sm">
                  <FiInfo className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Template Engine</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">Allow plants to utilize global form templates.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={form.isTemplateManagementEnabled}
                        onChange={(e) => setForm({ ...form, isTemplateManagementEnabled: e.target.checked })}
                      />
                      <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Detailed Information */}
          <div className="lg:col-span-8 space-y-8">
            <Card title="Compliance & Location" icon={FiShield} description="Legal and physical presence details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormInput
                    label="GSTIN / Tax ID"
                    icon={FiCheck}
                    value={form.gstNumber}
                    onChange={v => setForm({ ...form, gstNumber: v })}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-600 ml-1 flex items-center gap-2">
                    <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                    Corporate Headquarters Address
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-900 rounded-2xl min-h-[140px] shadow-sm"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Enter full legal address of the company..."
                  />
                </div>
              </div>
            </Card>

            <Card title="Communications" icon={FiMail} description="Primary point of contact for administrative updates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Official Email Address"
                  icon={FiMail}
                  type="email"
                  value={form.contactEmail}
                  onChange={v => setForm({ ...form, contactEmail: v })}
                  placeholder="admin@company.com"
                />
                <FormInput
                  label="Contact Phone Number"
                  icon={FiPhone}
                  value={form.contactPhone}
                  onChange={v => setForm({ ...form, contactPhone: v })}
                  placeholder="+1 (555) 000-0000"
                />
                <div className="md:col-span-2">
                  <FormInput
                    label="Corporate Website (Optional)"
                    icon={FiGlobe}
                    value={form.website || ""}
                    onChange={v => setForm({ ...form, website: v })}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </Card>

            {/* Final Actions */}
            <div className="flex items-center justify-between p-6 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <FiCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-wider">All systems go</h4>
                  <p className="text-indigo-100 text-[11px] font-medium">Verify your changes before finalizing the update.</p>
                </div>
              </div>
              <button 
                onClick={save}
                disabled={loading}
                className="px-8 py-3 bg-white text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? "Processing..." : "Commit Update"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
