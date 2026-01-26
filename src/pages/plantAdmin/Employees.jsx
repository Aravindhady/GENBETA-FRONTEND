import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import { Users, UserPlus, Mail, Phone, Briefcase, Search, Download, Table, Pencil, Trash2, X } from "lucide-react";
import { exportToExcel } from "../../utils/exportUtils";

function EmployeeRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-36 bg-gray-50 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-50 rounded" />
          <div className="h-3 w-24 bg-gray-50 rounded" />
        </div>
      </td>
        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full" /></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded" /></td>
      </tr>
  );
}

export default function Employees() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, employee: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
  const [editForm, setEditForm] = useState({ name: "", email: "", position: "", phoneNumber: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.plantId) fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    setLoading(true);
    const response = await userApi.getPlantEmployees(user.plantId);
    if (response.success) {
      setEmployees(response.data);
    } else {
      setError(response.message);
      toast.error(response.message || "Failed to load employees");
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportExcel = () => {
    const data = filteredEmployees.map(emp => ({
      Name: emp.name,
      Email: emp.email,
      Position: emp.position || "N/A",
      Phone: emp.phoneNumber || "N/A",
      Status: "Active",
      Joined: new Date(emp.createdAt).toLocaleDateString()
    }));
    exportToExcel(data, "Employee_Details");
    setShowExportMenu(false);
  };

  const openEditModal = (emp) => {
    setEditForm({
      name: emp.name || "",
      email: emp.email || "",
      position: emp.position || "",
      phoneNumber: emp.phoneNumber || ""
    });
    setEditModal({ open: true, employee: emp });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const response = await userApi.updateUser(editModal.employee._id, editForm);
    if (response.success) {
      toast.success("Employee updated successfully");
      setEditModal({ open: false, employee: null });
      fetchEmployees();
    } else {
      toast.error(response.message || "Failed to update employee");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    const response = await userApi.deleteUser(deleteModal.employee._id);
    if (response.success) {
      toast.success("Employee deleted successfully");
      setDeleteModal({ open: false, employee: null });
      fetchEmployees();
    } else {
      toast.error(response.message || "Failed to delete employee");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-500">Manage your plant's team and assign roles.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => navigate("/plant/employees/add")} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <EmployeeRowSkeleton key={i} />)
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No employees found.</td></tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">{emp.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-sm text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{emp.position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="w-3 h-3" />{emp.email}</div>
                        {emp.phoneNumber && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-3 h-3" />{emp.phoneNumber}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(emp)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteModal({ open: true, employee: emp })} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Employee</h3>
              <button onClick={() => setEditModal({ open: false, employee: null })} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input type="text" value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal({ open: false, employee: null })} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Employee</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-700">{deleteModal.employee?.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ open: false, employee: null })} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{saving ? "Deleting..." : "Delete"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
