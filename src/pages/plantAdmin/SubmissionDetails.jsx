import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission.api";
import FormRenderer from "../../components/FormRenderer/FormRenderer";
import { ArrowLeft, Loader2, Calendar, User, FileText, CheckCircle2, Clock, XCircle, Download, Printer } from "lucide-react";
import { formatDate } from "../../utils/formatDate";
import { CompanyHeader } from "../../components/common/CompanyHeader";
import { exportElementToPDF } from "../../utils/exportUtils";

export default function SubmissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    try {
      setExporting(true);
      await exportElementToPDF(contentRef.current, `Submission_${id}`);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const res = await submissionApi.getSubmissionById(id);
      if (res.success) {
        setSubmission(res.data);
      } else {
        setError(res.message || "Failed to fetch submission details");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching submission");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "submitted": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "submitted": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading submission details...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
        <p className="text-red-600 mb-6">{error || "Submission not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Company Header */}
      <CompanyHeader />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{submission.formId?.formName}</h1>
            <p className="text-gray-500">Submission Details & Review</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider ${getStatusColor(submission.status)}`}>
            {getStatusIcon(submission.status)}
            {submission.status}
          </div>
        </div>
      </div>

      <div ref={contentRef} className="space-y-8 bg-white p-[10mm] rounded-3xl shadow-sm border border-gray-100">
        <CompanyHeader />
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted By</p>
                <p className="text-lg font-bold text-gray-900">{submission.submittedBy?.name || submission.submittedBy}</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Submission Date</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(submission.createdAt)}</p>
            </div>
          </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Form Info</p>
                {submission.formCode && (
                  <p className="text-lg font-bold text-indigo-600 uppercase font-mono">{submission.formCode}</p>
                )}
                <p className="text-xs text-gray-400 truncate max-w-[150px]">ID: {submission.formId?._id || submission.templateId?._id || submission.templateId}</p>
              </div>
            </div>
        </div>

        {/* Submitted Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 opacity-80" />
              <h2 className="text-xl font-bold tracking-tight">Submitted Form Data</h2>
            </div>
          </div>
          
          <div className="p-8 md:p-12 bg-gray-50/30">
            <FormRenderer 
              fields={submission.formId?.fields} 
              initialData={submission.data}
              readOnly={true}
            />
          </div>
        </div>

        {/* Approval Timeline/History (Optional) */}
        {submission.status !== "submitted" && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Approval Summary</h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className={`p-2 rounded-full ${submission.status === "approved" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {getStatusIcon(submission.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  This submission was <span className="font-bold">{submission.status}</span>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
