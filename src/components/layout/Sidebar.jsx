import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  FileText,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Factory,
  CheckCircle2,
  Layers,
    Inbox,
    UserPlus,
    ChevronLeft,
    ChevronRight
  } from "lucide-react";


export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const role = user?.role;

    if (role === "PLANT_ADMIN") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/plant/dashboard" },
          { title: "Templates", icon: Layers, path: "/plant/forms" },
          { title: "Forms", icon: FileText, path: "/plant/forms-view" },
          { title: "Submissions", icon: Inbox, path: "/plant/submissions" },
          { title: "Approvals", icon: CheckCircle2, path: "/plant/approval/pending" },
        ],
        secondary: [
          { title: "Employees", icon: Users, path: "/plant/employees" },
          { title: "Assignments", icon: ClipboardList, path: "/plant/assignments" },
          { title: "Plant Profile", icon: Factory, path: "/plant/profile" },
        ]
      };
    }

    const commonItems = [
      { title: "My Profile", icon: Users, path: "/profile" },
    ];

    if (role === "SUPER_ADMIN") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/super/dashboard" },
          { title: "Companies", icon: Building2, path: "/super/companies" },
        ],
        secondary: commonItems
      };
    }

    if (role === "COMPANY_ADMIN") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/company/dashboard" },
          { title: "Company Profile", icon: Building2, path: "/company/profile" },
          { title: "Plants", icon: Factory, path: "/company/plants" },
        ],
        secondary: commonItems
      };
    }

    if (role === "EMPLOYEE") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
          { title: "Forms", icon: FileText, path: "/employee/forms-view" },
          { title: "Facility", icon: FileText, path: "/employee/templates" },
          { title: "Assigned Forms", icon: ClipboardList, path: "/employee/assignments" },
          { title: "Pending Approvals", icon: CheckCircle2, path: "/employee/approval/pending" },
        ],
        secondary: commonItems
      };
    }

    return { primary: [], secondary: [] };
  };

  const sections = getMenuItems();

  const renderNavLink = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      title={!isOpen ? item.title : ""}
      className={({ isActive }) => `flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2.5 rounded-xl transition-all duration-200 group relative ${
        isActive 
          ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm shadow-indigo-100/50 font-semibold" 
          : "text-slate-600 hover:bg-slate-50/80 hover:text-indigo-600"
      }`}
    >
      <item.icon className={`w-4.5 h-4.5 transition-all flex-shrink-0 ${
        location.pathname === item.path ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
      }`} />
      <span className={`text-[13px] font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
        isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
      }`}>
        {item.title}
      </span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />
      )}

        {/* Sidebar */}
        <aside className={`fixed lg:relative inset-y-0 left-0 z-50 bg-gradient-to-b from-white to-slate-50/30 border-r border-slate-200/60 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-lg lg:shadow-xl ${
          isOpen ? "w-60 translate-x-0" : "w-[72px] -translate-x-full lg:translate-x-0"
        }`}>
          {/* Edge Toggle Button */}
          <button
            onClick={onToggle}
            className="absolute -right-3 top-8 z-[60] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md transition-all hover:text-indigo-600 hover:border-indigo-300 hover:shadow-lg hidden lg:flex"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          <div className="flex flex-col h-full overflow-hidden">

          {/* Header */}
          <div className={`h-16 flex items-center border-b border-slate-200/60 gap-3 transition-all duration-300 ${
            isOpen ? "px-6" : "justify-center px-0"
          }`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
              {user?.companyLogo ? (
                <img 
                  src={user.companyLogo} 
                  alt="Logo" 
                  className="w-full h-full object-contain p-1 invert"
                />
              ) : (
                <Factory className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={`min-w-0 transition-all duration-200 ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {user?.companyName || "Plant Admin"}
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block leading-none mt-0.5">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {/* Primary Navigation */}
            <div className="space-y-1">
              <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-all duration-200 ${
                isOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
              }`}>
                Primary
              </p>
              {sections.primary.map(renderNavLink)}
            </div>

            {/* Secondary Navigation */}
            {sections.secondary.length > 0 && (
              <div className="space-y-1">
                <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-all duration-200 ${
                  isOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
                }`}>
                  Management
                </p>
                {sections.secondary.map(renderNavLink)}
              </div>
            )}
          </div>

        {/* Footer Section */}
        <div className="p-3 border-t border-slate-200/60 space-y-1">
          {user?.role !== "PLANT_ADMIN" && (
            <NavLink
              to="/settings"
              title={!isOpen ? "Settings" : ""}
              className={({ isActive }) => `flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm shadow-indigo-100/50 font-semibold" 
                  : "text-slate-600 hover:bg-slate-50/80 hover:text-indigo-600"
              }`}
            >
              <Settings className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
              <span className={`text-[13px] font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}>
                Settings
              </span>
            </NavLink>
          )}
          
          <button
              onClick={logout}
              title={!isOpen ? "Sign Out" : ""}
              className={`w-full flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2.5 rounded-xl text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 group font-medium`}
            >
              <LogOut className="w-4.5 h-4.5 flex-shrink-0 transition-all" />
              <span className={`text-[13px] font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
