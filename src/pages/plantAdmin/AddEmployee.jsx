import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userApi } from "../../api/user.api";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Briefcase, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Crown,
  PhoneCall
} from "lucide-react";

export default function AddEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    position: ""
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    try {
      const res = await api.get("/subscription/usage");
      const data = res.data.data;
      setUsageInfo(data);
      
      const currentPlant = data.plantUsage?.find(p => p.plantId === user.plantId);
      if (currentPlant) {
        const limit = currentPlant.employeesLimit;
        if (limit !== "Unlimited" && currentPlant.employees >= limit) {
          setLimitReached(true);
        }
      }
    } catch (err) {
      console.error("Failed to check limits:", err);
    }
  };

    const handleCreateEmployee = async (e) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);
      const toastId = toast.loading("Creating new employee account...");
  
      try {
        const response = await userApi.createEmployee({
          ...formData,
          companyId: user.companyId,
          plantId: user.plantId
        });
  
        if (response.success) {
          toast.success("Employee account created successfully", { id: toastId });
          navigate("/plant/employees");
        } else {
          if (response.upgradeRequired) {
            setLimitReached(true);
          }
          setError(response.message || "Failed to create employee");
          toast.error(response.message || "Failed to create employee", { id: toastId });
        }
      } catch (err) {
        if (err.response?.data?.upgradeRequired) {
          setLimitReached(true);
          setError(err.response.data.message);
          toast.error(err.response.data.message, { id: toastId });
        } else {
          setError(err.response?.data?.message || "Something went wrong. Please try again.");
          toast.error(err.response?.data?.message || "Something went wrong", { id: toastId });
        }
      } finally {
        setSubmitting(false);
      }
    };

  const currentPlant = usageInfo?.plantUsage?.find(p => p.plantId === user.plantId);

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/plant/employees")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-500">Create a new account for your plant staff.</p>
        </div>
      </div>

{currentPlant && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">
                  Employee Usage: {currentPlant.employees} / {currentPlant.employeesLimit}
                </span>
              </div>
              {limitReached && (
                <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" /> Contact Admin to Upgrade
                </span>
              )}
            </div>
            {currentPlant.employeesLimit !== "Unlimited" && (
              <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${limitReached ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (currentPlant.employees / currentPlant.employeesLimit) * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {limitReached && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Employee Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              You've reached the maximum number of employees for your current plan. 
              Please contact your administrator to upgrade your plan.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
              <PhoneCall className="w-4 h-4" />
              Contact Admin to Upgrade
            </div>
          </div>
        )}

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${limitReached ? 'opacity-50 pointer-events-none' : ''}`}>
        <form onSubmit={handleCreateEmployee} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-gray-400" />
                Full Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Ramesh Kumar"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="ramesh@plant.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                Position
              </label>
              <input
                required
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Shift Manager"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/plant/employees")}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={submitting || limitReached}
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
  