import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function PlansPage() {
  const navigate = useNavigate();
  const [usageInfo, setUsageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsageInfo();
  }, []);

  const fetchUsageInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/subscription/usage");
      setUsageInfo(res.data.data);
    } catch (err) {
      console.error("Failed to fetch usage info:", err);
      setError(err.response?.data?.message || "Failed to load usage information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  const { plan, usage } = usageInfo;

  // Calculate remaining counts
  const employeesRemaining = usage?.employeesLimit === "Unlimited" 
    ? "Unlimited" 
    : usage?.employeesLimit - usage?.employees;
  
  const formsRemaining = usage?.formsLimit === "Unlimited" 
    ? "Unlimited" 
    : usage?.formsLimit - usage?.forms;
  
  const plantsRemaining = usage?.plantsLimit === "Unlimited" 
    ? "Unlimited" 
    : usage?.plantsLimit - usage?.plants;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription & Usage</h1>
        <p className="text-gray-500">Current plan details and resource usage statistics.</p>
      </div>

      {/* Plan Overview Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{plan?.name} Plan</h2>
            <p className="text-indigo-100 mt-1">{plan?.description}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-3xl font-bold">{plan?.price === 0 ? "Free" : `$${plan?.price}/month`}</div>
            <div className="text-indigo-200 text-sm">Billed {plan?.billingCycle}</div>
          </div>
        </div>
      </div>

      {/* Usage Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employees Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Employees</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">E</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm font-semibold text-gray-900">{usage?.employees || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Limit:</span>
              <span className="text-sm font-semibold text-gray-900">{usage?.employeesLimit || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Remaining:</span>
              <span className={`text-sm font-semibold ${employeesRemaining === "Unlimited" ? "text-green-600" : employeesRemaining < 10 ? "text-red-600" : "text-gray-900"}`}>
                {employeesRemaining}
              </span>
            </div>
          </div>
          {usage?.employeesLimit !== "Unlimited" && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Usage</span>
                <span>{Math.round(((usage?.employees || 0) / usage?.employeesLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, ((usage?.employees || 0) / usage?.employeesLimit) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Forms Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Forms</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">F</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm font-semibold text-gray-900">{usage?.forms || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Limit:</span>
              <span className="text-sm font-semibold text-gray-900">{usage?.formsLimit || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Remaining:</span>
              <span className={`text-sm font-semibold ${formsRemaining === "Unlimited" ? "text-green-600" : formsRemaining < 10 ? "text-red-600" : "text-gray-900"}`}>
                {formsRemaining}
              </span>
            </div>
          </div>
          {usage?.formsLimit !== "Unlimited" && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Usage</span>
                <span>{Math.round(((usage?.forms || 0) / usage?.formsLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, ((usage?.forms || 0) / usage?.formsLimit) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Plants Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Plants</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">P</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm font-semibold text-gray-900">{usage?.plants || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Limit:</span>
              <span className="text-sm font-semibold text-gray-900">{usage?.plantsLimit || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Remaining:</span>
              <span className={`text-sm font-semibold ${plantsRemaining === "Unlimited" ? "text-green-600" : plantsRemaining < 10 ? "text-red-600" : "text-gray-900"}`}>
                {plantsRemaining}
              </span>
            </div>
          </div>
          {usage?.plantsLimit !== "Unlimited" && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Usage</span>
                <span>{Math.round(((usage?.plants || 0) / usage?.plantsLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, ((usage?.plants || 0) / usage?.plantsLimit) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Plan Features */}
      {plan?.features && plan.features.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Plan Features</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}