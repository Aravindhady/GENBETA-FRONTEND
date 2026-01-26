import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { getAllPlans } from "../config/plans";
import CustomPlanModal from "../components/modals/CustomPlanModal";

// Sub-components
import { CompanyInfoForm } from "../components/companies/CompanyInfoForm";
import { PlantManager } from "../components/companies/PlantManager";
import { PlanSelector } from "../components/companies/PlanSelector";
import { AdminCredentialsForm } from "../components/companies/AdminCredentialsForm";

export default function CreateCompany() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const PLANS = getAllPlans();

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("SILVER");

  const [customLimits, setCustomLimits] = useState({
    maxPlants: 1,
    maxFormsPerPlant: 10,
    maxEmployeesPerPlant: 20,
    approvalLevels: 3
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const [company, setCompany] = useState({
    companyName: "",
    industry: "",
    contactEmail: "",
    address: "",
    gstNumber: "",
    logoUrl: "",
  });

  const [plants, setPlants] = useState([
    { 
      plantName: "", 
      plantNumber: "", 
      location: "",
      adminName: "",
      adminEmail: "",
      adminPassword: ""
    }
  ]);

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await fetch("/api/companies/upload-logo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setCompany(prev => ({ ...prev, logoUrl: data.logoUrl }));
      toast.success("Logo uploaded successfully");
    } catch (err) {
      setError(err.message || "Logo upload failed");
      toast.error(err.message || "Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const addPlant = () => setPlants([...plants, { 
    plantName: "", 
    plantNumber: "", 
    location: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "" 
  }]);
  
  const removePlant = (index) => setPlants(plants.filter((_, i) => i !== index));
  
  const updatePlant = (index, key, value) => {
    setPlants((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!company.companyName || !admin.name || !admin.email || !admin.password) {
      setError("Please fill in all required fields marked with *");
      toast.error("Please fill in all required fields");
      return;
    }

    if (plants.length === 0 || plants.some((p) => !p.plantName)) {
      setError("Please add at least one plant and fill its name");
      toast.error("Please add at least one plant");
      return;
    }

    if (!emailRegex.test(admin.email)) {
      setError("Enter a valid admin email");
      toast.error("Enter a valid admin email");
      return;
    }

    if (admin.password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating company...");
    try {
      const response = await api.post("/companies/create-with-plants-admin", {
        company,
        plants,
        admin,
        plan: selectedPlan,
        customLimits: selectedPlan === "CUSTOM" ? customLimits : null
      });

      const res = response.data;

      setSuccess(res?.message || "Company and infrastructure created successfully!");
      toast.success(res?.message || "Company created successfully!", { id: toastId });
      setTimeout(() => navigate("/super/companies"), 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to create company"
      );
      toast.error(err?.response?.data?.message || err?.message || "Failed to create company", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Subscription", description: "Select Plan" },
    { id: 2, name: "Company & Plants", description: "Business Details" },
    { id: 3, name: "Administrator", description: "Primary Access" }
  ];

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-slate-50 min-h-screen">
      <form onSubmit={submit} className="relative">
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="max-w-full mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={step === 1 ? () => navigate("/super/companies") : prevStep}
                className="group flex items-center text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {step === 1 ? "Back to Companies" : step === 2 ? "Back to Plans" : "Back to Company Details"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => navigate("/super/companies")} 
                disabled={loading}
                className="hidden md:block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type={step === 3 ? "submit" : "button"}
                onClick={step === 3 ? undefined : nextStep}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {step === 1 ? "Next: Company Information" : step === 2 ? "Next: Administrator" : "Complete Registration"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          <div className="max-w-full mx-auto space-y-8">
            {/* Header Title Section */}
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Create New Entity</h1>
              <p className="text-slate-500 font-medium">Initialize a new company through our guided onboarding process.</p>
            </div>

            {/* Step Indicator */}
            <nav aria-label="Progress" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <ol role="list" className="flex items-center justify-between">
            {steps.map((s, index) => (
              <li key={s.id} className={`flex-1 relative ${index !== steps.length - 1 ? "pr-4" : ""}`}>
                <div className="flex items-center group">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${step > s.id ? "bg-indigo-600 border-indigo-600" : step === s.id ? "border-indigo-600 text-indigo-600" : "border-slate-200 text-slate-400"}
                  `}>
                    {step > s.id ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-sm font-bold">{s.id}</span>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col">
                    <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.id ? "text-indigo-600" : "text-slate-400"}`}>
                      Step {s.id}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className={`absolute top-5 left-10 w-full h-[2px] -z-10 bg-slate-100 ${step > s.id ? "bg-indigo-600" : ""}`} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Registration Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-800">Success</h3>
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="max-w-full mx-auto">
            <PlanSelector 
              plans={PLANS}
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              customLimits={customLimits}
              setIsCustomModalOpen={setIsCustomModalOpen}
            />
          </div>
        )}

        {step === 2 && (
          <div className="max-w-full mx-auto space-y-8">
            <div className="space-y-8">
              <CompanyInfoForm 
                company={company}
                setCompany={setCompany}
                uploading={uploading}
                handleLogoUpload={handleLogoUpload}
              />

              <PlantManager 
                plants={plants}
                onAdd={addPlant}
                onRemove={removePlant}
                onUpdate={updatePlant}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-full mx-auto space-y-8">
            <AdminCredentialsForm 
              admin={admin}
              setAdmin={setAdmin}
              loading={loading}
              plants={plants}
              company={company}
            />
          </div>
        )}
      </div>
    </div>
  </form>
      
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
