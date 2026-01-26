import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { formApi } from "../../api/form.api";
import { submissionApi } from "../../api/submission.api";
import { 
  Plus, 
  Loader2,
  FileText,
  Search,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function EmployeeTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, submissionsRes] = await Promise.all([
        formApi.getForms(),
        submissionApi.getSubmissions()
      ]);

        if (formsRes.success) {
          setTemplates(formsRes.data);
        } else {
          toast.error(formsRes.message || "Failed to fetch templates");
        }
        if (submissionsRes.success) {
          setSubmissions(submissionsRes.data);
        } else {
          toast.error(submissionsRes.message || "Failed to fetch submissions");
        }
      } catch (error) {
        toast.error("An error occurred while fetching data");
      } finally {
      setLoading(false);
    }
  };

  const isFormFilled = (formId) => {
    return submissions.some(s => s.templateId?._id === formId || s.templateId === formId);
  };

  const filteredTemplates = templates.filter(t => 
    t.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.numericalId ? `F-${t.numericalId.toString().padStart(3, '0')}` : (t.formId || t._id || "")).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility</h1>
          <p className="text-gray-500 text-sm">Select a facility to fill and submit for approval.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full md:w-64 text-sm"
          />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No templates found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? "Try adjusting your search" : "No templates are available at the moment"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Form Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Form ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Levels</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Created At</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredTemplates.map((template) => {
                        const filled = isFormFilled(template._id);
                        return (
                          <tr key={template._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {template.formName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <span 
                                className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 cursor-help"
                                title={`Raw ID: ${template._id}${template.formId ? ` | Form Code: ${template.formId}` : ''}${template.numericalId ? ` | Display: F-${template.numericalId.toString().padStart(3, '0')}` : ''}`}
                              >
                                {template.numericalId ? `F-${template.numericalId.toString().padStart(3, '0')}` : (template.formId || template._id || "—")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {filled ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Filled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                  <Clock className="w-3.5 h-3.5" />
                                  Not Filled
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {template.approvalLevels?.length || template.approvalFlow?.length || 1} Levels
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {template.createdAt ? new Date(template.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => navigate(`/employee/fill-template/${template._id}`)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
                                  filled 
                                    ? 'bg-amber-600 text-white hover:bg-amber-700' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                              >
                                <Plus className="w-4 h-4" />
                                {filled ? 'Re-fill' : 'Fill Form'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
