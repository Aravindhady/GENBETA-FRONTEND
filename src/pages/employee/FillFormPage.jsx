import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { assignmentApi } from "../../api/assignment.api";
import { formApi } from "../../api/form.api";
import FormRenderer from "../../components/FormRenderer/FormRenderer";
import { ArrowLeft, Loader2, FileText, User, Calendar, Send, ShieldCheck, ArrowRight } from "lucide-react";

export default function FillFormPage() {
  const { taskId, formId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    } else if (taskId) {
      fetchTask();
    } else if (formId) {
      fetchForm();
    }
  }, [taskId, formId, assignmentId]);

    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const response = await assignmentApi.getAssignmentById(assignmentId);
        if (response.success) {
          setTask(response.data);
          setForm(response.data.templateId);
          if (response.data.status === "FILLED") {
            setError("This assignment has already been filled.");
          }
        } else {
          setError(response.message || "Failed to load assignment");
        }
      } catch (err) {
        setError("An error occurred while fetching the assignment");
      } finally {
        setLoading(false);
      }
    };

    const fetchTask = async () => {
      setLoading(true);
      const response = await assignmentApi.getTaskById(taskId);
      if (response.success) {
        setTask(response.data);
        setForm(response.data.templateId);
      } else {
        setError(response.message || "Failed to load form");
      }
      setLoading(false);
    };

  const fetchForm = async () => {
    setLoading(true);
    const response = await formApi.getFormById(formId);
    if (response.success) {
      setForm(response.data);
    } else {
      setError(response.message || "Failed to load template");
    }
    setLoading(false);
  };

    const handleSubmit = async (formData, files = []) => {
      setSubmitting(true);
      setError("");
  
    let response;
    if (assignmentId) {
      response = await assignmentApi.submitAssignment(assignmentId, formData, files);
    } else if (taskId) {
      response = await assignmentApi.submitTask(taskId, formData, files);
    } else {
      response = await assignmentApi.submitDirect(formId, formData, files);
    }

    
    if (response.success) {
      toast.success("Form submitted successfully!");
      navigate("/employee", { state: { shouldRefresh: true } });
    } else {
      const msg = response.message || "Failed to submit form";
      setError(msg);
      toast.error(msg);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => navigate("/employee")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate("/employee")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{form?.templateName || form?.formName}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">

              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{taskId ? `Assigned by: ${task?.assignedBy?.name || "Admin"}` : "Facility"}</span>
              </div>
              {taskId && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(task?.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Workflow Sequence Display */}
          {form?.approvalFlow && form.approvalFlow.length > 0 && (
            <div className="mb-10 bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Approval Sequence</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Required verification layers</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {form.approvalFlow.map((level, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{level.name}</span>
                        <span className="text-[11px] font-bold text-slate-700">{level.approverId?.name || "Unassigned"}</span>
                      </div>
                    </div>
                    {idx < form.approvalFlow.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

            {!error && (
              <FormRenderer
                form={form}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            )}
      </div>
    </div>
  );
}
