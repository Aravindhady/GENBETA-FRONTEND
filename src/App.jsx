import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superAdmin/Dashboard";
import CompanyPage from "./pages/CompanyPage";
import CreateCompany from "./pages/CreateCompany";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import EditCompanyPage from "./pages/EditCompanyPage";
import AddPlantPage from "./pages/superAdmin/AddPlantPage";

// Company Admin Pages
import CompanyAdminDashboard from "./pages/companyAdmin/Dashboard";
import PlantList from "./pages/companyAdmin/PlantList";
import CreatePlant from "./pages/companyAdmin/CreatePlant";
import CompanyProfile from "./pages/companyAdmin/Profile";

import PlantAssignments from "./pages/plantAdmin/Assignments";
import EmployeeAssignments from "./pages/employee/Assignments";

// Plant Admin Pages
import PlantAdminDashboard from "./pages/plantAdmin/Dashboard";
import FormsList from "./pages/plantAdmin/FormsList";
import FormBuilderPage from "./pages/plantAdmin/FormBuilderPage";
import SubmissionsList from "./pages/plantAdmin/SubmissionsList";
import TemplateSubmissions from "./pages/plantAdmin/TemplateSubmissions";
import Employees from "./pages/plantAdmin/Employees";
import AddEmployee from "./pages/plantAdmin/AddEmployee";
import PlantProfile from "./pages/plantAdmin/Profile";

// Employee Pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeTemplates from "./pages/employee/Templates";
import AvailableForms from "./pages/employee/AvailableForms";
import SubmissionsView from "./pages/employee/SubmissionsView";
import FillFormPage from "./pages/employee/FillFormPage";
import BulkApprovalPage from "./pages/approval/BulkApprovalPage";
import PendingApprovals from "./pages/approval/PendingApprovals";
import ApprovalDetail from "./pages/approval/ApprovalDetail";
import Profile from "./pages/Profile";
import FormsCardView from "./pages/FormsCardView";

// Public Pages
import ApprovalPage from "./pages/public/ApprovalPage";
import SubmittedSuccess from "./pages/public/SubmittedSuccess";

function getDefaultRoute(role) {
  switch (role) {
    case "SUPER_ADMIN": return "/super/dashboard";
    case "COMPANY_ADMIN": return "/company/dashboard";
    case "PLANT_ADMIN": return "/plant/dashboard";
    case "EMPLOYEE": return "/employee/dashboard";
    default: return "/login";
  }
}

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute(user?.role)} /> : <LandingPage />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute(user?.role)} />} />
        
        {/* Public Approval Pages */}
        <Route path="/approve/:token" element={<ApprovalPage />} />
        <Route path="/submitted" element={<SubmittedSuccess />} />

          {/* Super Admin Routes */}
          <Route path="/super" element={<ProtectedRoute roles={["SUPER_ADMIN"]}><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="companies" element={<CompanyPage />} />
            <Route path="companies/create" element={<CreateCompany />} />
                <Route path="companies/:id" element={<CompanyDetailPage />} />
                <Route path="companies/:id/edit" element={<EditCompanyPage />} />
                <Route path="companies/:id/plants/add" element={<AddPlantPage />} />
          </Route>

        {/* Company Admin Routes */}
        <Route path="/company" element={<ProtectedRoute roles={["COMPANY_ADMIN"]}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<CompanyAdminDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="plants" element={<PlantList />} />
          <Route path="plants/create" element={<CreatePlant />} />
        </Route>

          {/* Plant Admin Routes */}
            <Route path="/plant" element={<ProtectedRoute roles={["PLANT_ADMIN"]}><MainLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PlantAdminDashboard />} />
              <Route path="profile" element={<PlantProfile />} />
              <Route path="forms-view" element={<FormsCardView />} />
                <Route path="employees" element={<Employees />} />
                <Route path="employees/add" element={<AddEmployee />} />
                <Route path="forms" element={<FormsList />} />
                <Route path="forms/create" element={<FormBuilderPage />} />
                <Route path="forms/create/:view" element={<FormBuilderPage />} />
                <Route path="forms/:id/edit" element={<FormBuilderPage />} />
                <Route path="forms/:id/edit/:view" element={<FormBuilderPage />} />
              <Route path="submissions" element={<SubmissionsList />} />
              <Route path="submissions/template/:templateName" element={<TemplateSubmissions />} />
              <Route path="submissions/:id" element={<ApprovalDetail />} />
              <Route path="approval/pending" element={<PendingApprovals />} />
              <Route path="approval/detail/:id" element={<ApprovalDetail />} />
            </Route>

{/* Employee Routes */}
                <Route path="/employee" element={<ProtectedRoute roles={["EMPLOYEE"]}><MainLayout /></ProtectedRoute>}>
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="forms-view" element={<FormsCardView />} />
                    <Route path="submissions-view" element={<SubmissionsView />} />
                      <Route path="templates" element={<EmployeeTemplates />} />
                    <Route path="forms" element={<AvailableForms />} />

                  <Route index element={<EmployeeDashboard />} />
                  <Route path="fill-form/:taskId" element={<FillFormPage />} />
                  <Route path="fill-assignment/:assignmentId" element={<FillFormPage />} />
                  <Route path="fill-template/:formId" element={<FillFormPage />} />

                  <Route path="bulk-approval/:taskId" element={<BulkApprovalPage />} />
                  <Route path="submissions/:id" element={<ApprovalDetail />} />
                  <Route path="approval/pending" element={<PendingApprovals />} />
                  <Route path="approval/detail/:id" element={<ApprovalDetail />} />
                </Route>

          {/* Catch all */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
