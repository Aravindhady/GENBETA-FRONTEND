import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      SUPER_ADMIN: "Super Admin",
      PLANT_ADMIN: "Plant Admin",
      COMPANY_ADMIN: "Company Admin",
      CLIENT: "Client"
    };
    return roleMap[role] || role;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left: Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Center: Title (optional) */}
        <div className="flex-1 lg:ml-0 ml-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
            GenBeta
          </h1>
        </div>

          {/* Right: User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                {user?.companyLogo ? (
                  <img 
                    src={user.companyLogo} 
                    alt={user.companyName} 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{user?.name || "User"}</p>
                <p className="text-xs text-slate-500 font-medium">{getRoleDisplay(user?.role)}</p>
              </div>
            </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg shadow-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}




