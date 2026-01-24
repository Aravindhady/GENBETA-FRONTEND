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
  Clock,
  Eye
} from "lucide-react";

export default function AvailableForms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
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
        setForms(formsRes.data);
      } else {
        toast.error(formsRes.message || "Failed to fetch forms");
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

  const getSubmission = (formId) => {
    return submissions.find(s => 
      s.templateId?._id === formId || 
      s.templateId === formId || 
      s.formId?._id === formId || 
      s.formId === formId
    );
  };

  const filteredForms = forms.filter(f => 
    f.formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Available Forms</h1>
          <p className="text-gray-500 text-sm">Select a form to fill and submit for approval.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full md:w-64 text-sm"
          />
        </div>
      </div>

      {filteredForms.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No forms found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? "Try adjusting your search" : "No forms are available at the moment"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Form Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Levels</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Created At</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredForms.map((form) => {
                    const submission = getSubmission(form._id);
                    const filled = !!submission;
                    return (
                      <tr key={form._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {form.formName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 min-w-[300px]">
                          <p className="line-clamp-1">{form.description || "—"}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {filled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Form Filled
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
                            {form.approvalFlow?.length || 1} Levels
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {form.createdAt ? new Date(form.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {filled && (
                              <button
                                onClick={() => navigate(`/employee/submissions/${submission._id}`)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/employee/fill-template/${form._id}`)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
                                filled 
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                              }`}
                            >
                              {filled ? <FileText className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              {filled ? "Re-fill" : "Fill Form"}
                            </button>
                          </div>
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
