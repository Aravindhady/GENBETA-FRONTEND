import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, 
  Factory, 
  Plus, 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Hash,
  Save,
  Loader2
} from "lucide-react";

export default function AddPlantPage() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [plant, setPlant] = useState({
    plantName: "",
    location: "",
    plantNumber: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const save = async () => {
    if (!plant.plantName || !plant.location || !plant.adminEmail || !plant.adminPassword) {
      toast.error("Please fill in all the required fields");
      return;
    }

    const toastId = toast.loading("Creating new plant...");
    try {
      setLoading(true);
      await apiRequest(
        "/api/plants",
        "POST",
        {
          companyId,
          name: plant.plantName,
          location: plant.location,
          plantNumber: plant.plantNumber,
          admin: {
            name: plant.adminName,
            email: plant.adminEmail,
            password: plant.adminPassword
          }
        },
        token
      );

      toast.success("Plant created successfully", { id: toastId });
      navigate(`/super/companies/${companyId}`);
    } catch (err) {
      toast.error(err.message || "Failed to add plant", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="relative">
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/super/companies/${companyId}`)}
                className="group flex items-center text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Company
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/super/companies/${companyId}`)}
                disabled={loading}
                className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-semibold shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{loading ? "Creating..." : "Create Plant"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Factory className="w-5 h-5 text-indigo-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Add New Plant
                </h1>
              </div>
              <p className="text-sm text-gray-500 ml-[52px]">
                Register a new manufacturing unit and set up its initial administrator.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Plant Details Section */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                    <Factory className="w-4 h-4 text-gray-400" />
                    <h2 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider">
                      Plant Information
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-500 ml-1">Plant Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={plant.plantName}
                          placeholder="e.g. Pune Manufacturing Unit"
                          onChange={e => setPlant({ ...plant, plantName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        />
                        <Factory className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-500 ml-1">Plant Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={plant.plantNumber}
                          placeholder="e.g. PN-001"
                          onChange={e => setPlant({ ...plant, plantNumber: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        />
                        <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-500 ml-1">Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={plant.location}
                          placeholder="e.g. Chakan, Pune"
                          onChange={e => setPlant({ ...plant, location: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        />
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Details Section */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                    <User className="w-4 h-4 text-gray-400" />
                    <h2 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider">
                      Plant Administrator
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-500 ml-1">Admin Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={plant.adminName}
                          placeholder="Full Name"
                          onChange={e => setPlant({ ...plant, adminName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        />
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-500 ml-1">Admin Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={plant.adminEmail}
                          placeholder="email@example.com"
                          onChange={e => setPlant({ ...plant, adminEmail: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        />
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-500 ml-1">Initial Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={plant.adminPassword}
                          placeholder="••••••••"
                          onChange={e => setPlant({ ...plant, adminPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        />
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info / Summary */}
              <div className="space-y-6">
                <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100/50">
                  <h3 className="text-[13px] font-semibold text-indigo-900 mb-2">Registration Guide</h3>
                  <p className="text-[12px] text-indigo-700/80 leading-relaxed">
                    Plants are specific operational units within a company. Each plant requires its own administrator who will manage employees and forms for that specific location.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {[
                      "Unique plant number",
                      "Physical location address",
                      "Dedicated admin account"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-[12px] text-indigo-700/70">
                        <div className="w-1 h-1 rounded-full bg-indigo-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-[13px] font-semibold text-gray-900 mb-4 uppercase tracking-wider">Quick Actions</h3>
                  <button
                    onClick={save}
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button
                    onClick={() => navigate(`/super/companies/${companyId}`)}
                    className="w-full py-2.5 bg-white border border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-[13px] font-medium transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
