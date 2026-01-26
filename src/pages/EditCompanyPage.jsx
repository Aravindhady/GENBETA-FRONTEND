import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Input, Section } from "../components/modals/Modal";
import { Upload, X, ArrowLeft, Save, Building2, Briefcase, Phone, Mail, MapPin, FileText, Shield } from "lucide-react";

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
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setFetching(true);
        const response = await api.get(`/companies/${id}`);
        const company = response.data;
        setForm({
          name: company.name || "",
          industry: company.industry || "",
          contactEmail: company.contactEmail || "",
          contactPhone: company.contactPhone || "",
          gstNumber: company.gstNumber || "",
          address: company.address || "",
        });
        if (company.logo) {
          setLogoPreview(company.logo);
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
      const toastId = toast.loading("Updating company profile...");
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

        toast.success("Company profile updated successfully", { id: toastId });
        navigate("/super/companies");
      } catch (err) {
        toast.error(err.message || "Failed to update company", { id: toastId });
      } finally {
        setLoading(false);
      }
    };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin animation-delay-150 mb-6"></div>
        </div>
        <p className="text-slate-600 font-semibold text-lg">Loading company details...</p>
        <p className="text-slate-400 text-sm mt-2">Please wait...</p>
    </div>
    );
}
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 min-h-screen">
      <div className="relative">
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="w-full px-6 md:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/super/companies")}
                className="group flex items-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all gap-2.5"
              >
                <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition-all group-hover:shadow-sm">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                Back to Companies
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/super/companies")}
                disabled={loading}
                className="hidden md:block px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full px-6 md:px-8 py-8 space-y-8">
          <div className="w-full space-y-8">
            {/* Header Title Section */}
            <div className="mb-8">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl shadow-xl shadow-indigo-500/40">
                    <Building2 className="w-10 h-10" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-lg"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Edit Company Profile</h1>
                  <p className="text-slate-600 font-medium flex items-center gap-2">
                    <span>Updating details for</span>
                    <span className="font-bold text-indigo-600">{form.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-8 md:px-10 py-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 mb-1">Company Information</h2>
                    <p className="text-sm text-slate-600">Keep your company profile up to date</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-600">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                
                {/* LOGO SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                      <Building2 size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Company Identity</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Upload your company logo</p>
                    </div>
                  </div>
                  <div className="relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-200 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-100/50 hover:via-purple-100/30 hover:to-white transition-all group">
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Logo</span>
                      </div>
                    </div>
                    {logoPreview ? (
                      <div className="relative group/logo">
                        <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-xl group-hover/logo:shadow-2xl group-hover/logo:border-indigo-300 transition-all">
                          <img 
                            src={logoPreview} 
                            alt="Preview" 
                            className="w-48 h-48 object-contain" 
                          />
                        </div>
                        <button 
                          onClick={removeLogo}
                          className="absolute -top-3 -right-3 p-2.5 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                        >
                          <X size={20} />
                        </button>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover/logo:opacity-100 transition-opacity">
                          Current Logo
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-5 text-slate-500 hover:text-indigo-600 transition-all w-full"
                      >
                        <div className="relative">
                          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-300 group-hover:border-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                            <Upload size={40} className="group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">+</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-lg font-black block text-slate-800 mb-2">Click to Upload Logo</span>
                          <span className="text-sm text-slate-500 block mb-1">or drag and drop</span>
                          <span className="text-xs text-slate-400">PNG, JPG or SVG • Max 2MB</span>
                        </div>
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-widest">Company Details</span>
                  </div>
                </div>

                {/* BASIC DETAILS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                      <Briefcase size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">General Information</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Basic company details</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Building2 size={12} className="text-indigo-500" />
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={12} className="text-purple-500" />
                        Industry Type
                      </label>
                      <input
                        type="text"
                        value={form.industry}
                        onChange={e => setForm({ ...form, industry: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="e.g. Manufacturing, IT"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-widest">Contact & Location</span>
                  </div>
                </div>

                {/* CONTACT DETAILS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                      <Phone size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Contact Information</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Primary contact details</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} className="text-emerald-500" />
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={form.contactPhone}
                        onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} className="text-blue-500" />
                        Official Email
                      </label>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="contact@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-widest">Compliance & Address</span>
                  </div>
                </div>
                {/* COMPLIANCE & ADDRESS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                      <Shield size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Compliance & Location</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Tax details and physical address</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} className="text-amber-500" />
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={form.gstNumber}
                        onChange={e => setForm({ ...form, gstNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} className="text-rose-500" />
                        Full Office Address
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold min-h-[120px] hover:border-slate-300 resize-none"
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        placeholder="Street address, Building, Suite, City, State, Postal Code"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 px-8 md:px-10 py-8 border-t-2 border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                      <Save size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Ready to save?</p>
                      <p className="text-xs text-slate-500">All changes will be applied immediately</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => navigate("/super/companies")}
                      className="flex-1 sm:flex-none px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-all rounded-xl hover:bg-white/80 border-2 border-transparent hover:border-slate-200"
                    >
                      Discard
                    </button>
                    <button
                      onClick={save}
                      disabled={loading}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                        loading 
                          ? 'bg-slate-400 cursor-not-allowed text-white' 
                          : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-800 shadow-indigo-500/40 hover:shadow-indigo-500/50'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}

