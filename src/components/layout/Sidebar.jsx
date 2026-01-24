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
      const isTemplateEnabled = user?.isTemplateManagementEnabled ?? true;
  
      if (role === "PLANT_ADMIN") {
        const primary = [
          { title: "Dashboard", icon: LayoutDashboard, path: "/plant/dashboard" },
        ];

        if (isTemplateEnabled) {
          primary.push({ title: "Templates", icon: Layers, path: "/plant/forms" });
          primary.push({ title: "Forms View", icon: FileText, path: "/plant/forms-view" });
        } else {
          primary.push({ title: "Forms", icon: FileText, path: "/plant/forms" });
          primary.push({ title: "Submissions View", icon: Inbox, path: "/plant/forms-view" });
        }

        primary.push({ title: "Submissions", icon: Inbox, path: "/plant/submissions" });
        primary.push({ title: "Approvals", icon: CheckCircle2, path: "/plant/approval/pending" });

        return {
          primary,
          secondary: [
            { title: "Employees", icon: Users, path: "/plant/employees" },
            { title: "Plant Profile", icon: Factory, path: "/plant/profile" },
          ]
        };
      }
  
      if (role === "SUPER_ADMIN") {
        return {
          primary: [
            { title: "Dashboard", icon: LayoutDashboard, path: "/super/dashboard" },
            { title: "Companies", icon: Building2, path: "/super/companies" },
          ],
          secondary: [
            { title: "My Profile", icon: Users, path: "/super/profile" },
          ]
        };
      }
  
      if (role === "COMPANY_ADMIN") {
        return {
          primary: [
            { title: "Dashboard", icon: LayoutDashboard, path: "/company/dashboard" },
            { title: "Company Profile", icon: Building2, path: "/company/profile" },
            { title: "Plants", icon: Factory, path: "/company/plants" },
          ],
          secondary: []
        };
      }
  
        if (role === "EMPLOYEE") {
          const primary = [
            { title: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
          ];
  
            if (isTemplateEnabled) {
              primary.push({ title: "Forms", icon: FileText, path: "/employee/forms-view" });
              primary.push({ title: "Available Templates", icon: Layers, path: "/employee/templates" });
            } else {
              primary.push({ title: "Submissions View", icon: Inbox, path: "/employee/submissions-view" });
              primary.push({ title: "Available Forms", icon: FileText, path: "/employee/forms" });
            }
  
            primary.push({ title: "Pending Approvals", icon: CheckCircle2, path: "/employee/approval/pending" });

        return {
          primary,
          secondary: [
            { title: "My Profile", icon: Users, path: "/employee/profile" },
          ]
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
      className={({ isActive }) => `flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2 rounded-lg transition-all duration-200 group relative ${
        isActive 
          ? "bg-gray-100 text-gray-900" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <item.icon className={`w-4 h-4 transition-colors flex-shrink-0 ${
        location.pathname === item.path ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-900"
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
        <aside className={`fixed lg:relative inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${
          isOpen ? "w-60 translate-x-0" : "w-[72px] -translate-x-full lg:translate-x-0"
        }`}>
          {/* Edge Toggle Button */}
          <button
            onClick={onToggle}
            className="absolute -right-3 top-8 z-[60] flex h-6 w-6 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-sm transition-all hover:text-gray-900 hover:shadow-md hidden lg:flex"
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
          <div className={`h-16 flex items-center border-b border-gray-50 gap-3 transition-all duration-300 ${
            isOpen ? "px-6" : "justify-center px-0"
          }`}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
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
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {user?.companyName || "Plant Admin"}
              </h2>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block leading-none mt-0.5">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {/* Primary Navigation */}
            <div className="space-y-1">
              <p className={`px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-200 ${
                isOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
              }`}>
                Primary
              </p>
              {sections.primary.map(renderNavLink)}
            </div>

            {/* Secondary Navigation */}
            {sections.secondary.length > 0 && (
              <div className="space-y-1">
                <p className={`px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-all duration-200 ${
                  isOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
                }`}>
                  Management
                </p>
                {sections.secondary.map(renderNavLink)}
              </div>
            )}
          </div>

        {/* Footer Section */}
        <div className="p-3 border-t border-gray-50 space-y-1">
          {user?.role !== "PLANT_ADMIN" && (
            <NavLink
              to="/settings"
              title={!isOpen ? "Settings" : ""}
              className={({ isActive }) => `flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-900 flex-shrink-0" />
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
              className={`w-full flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2 rounded-lg text-red-500 hover:bg-red-50/50 transition-all duration-200 group`}
            >
              <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100 flex-shrink-0" />
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
