import { useState, useEffect } from "react";
import { Plus, Search, FileText, Trash2, Edit, Check, Users, Copy, RefreshCw, Download, Loader2, Table } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { formApi } from "../../api/form.api";
import { templateApi } from "../../api/template.api";
import { assignmentApi } from "../../api/assignment.api";
import { submissionApi } from "../../api/submission.api";
import { exportToExcel, formatSubmissionsForExport, formatTemplateForExport } from "../../utils/excelExport";
import ApproverSelectionModal from "../../components/modals/ApproverSelectionModal";
import { Modal, Input } from "../../components/modals/Modal";
import { ActionBar } from "../../components/common/ActionBar";

export default function FormsList() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForms, setSelectedForms] = useState([]);
  const [activeTab, setActiveTab] = useState("PUBLISHED"); // PUBLISHED, DRAFT, or ARCHIVED
  const [isApproverModalOpen, setIsApproverModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFormName, setNewFormName] = useState("");
    const [exportingId, setExportingId] = useState(null);
    const [showExportOptions, setShowExportOptions] = useState(null);
    const [isCreating, setIsCreating] = useState(false);


  const { user } = useAuth();
  const isTemplateManagementEnabled = user?.isTemplateManagementEnabled ?? true;

  const handleExportTemplateDetails = (item) => {
    const data = formatTemplateForExport(item);
    const fileName = `${item.templateName || item.formName}_Details`;
    exportToExcel(data, fileName);
    setShowExportOptions(null);
  };

  const handleExportTemplateData = async (item) => {
    setExportingId(item._id);
    try {
      const res = await submissionApi.getSubmissions({ 
        templateId: item.isLegacy ? item._id : undefined,
        formId: !item.isLegacy ? item._id : undefined
      });
      
      const submissions = res.success ? res.data : (Array.isArray(res) ? res : []);
      
      if (submissions.length > 0) {
        const formattedData = formatSubmissionsForExport(submissions);
        const fileName = `${item.templateName || item.formName}_Submissions`;
        exportToExcel(formattedData, fileName);
      } else {
        toast.error("No submission data found for this template.");
      }
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export template data.");
    } finally {
      setExportingId(null);
      setShowExportOptions(null);
    }
  };

  const handleExportStats = async (item) => {
    setExportingId(item._id);
    try {
      const res = await submissionApi.getSubmissions({ 
        templateId: item.isLegacy ? item._id : undefined,
        formId: !item.isLegacy ? item._id : undefined
      });
      
      const submissions = res.success ? res.data : (Array.isArray(res) ? res : []);
      
      const total = submissions.length;
      const approved = submissions.filter(s => s.status?.toUpperCase() === "APPROVED").length;
      const rejected = submissions.filter(s => s.status?.toUpperCase() === "REJECTED").length;
      const pending = total - approved - rejected;

      const stats = [
        { Metric: "Total Submissions", Count: total },
        { Metric: "Approved", Count: approved },
        { Metric: "Rejected", Count: rejected },
        { Metric: "Pending", Count: pending },
        { Metric: "Approval Rate", Count: total > 0 ? `${((approved / total) * 100).toFixed(1)}%` : "0%" }
      ];

      const fileName = `${item.templateName || item.formName}_Stats`;
      exportToExcel(stats, fileName);
    } catch (err) {
      console.error("Stats export failed:", err);
      toast.error("Failed to export statistics.");
    } finally {
      setExportingId(null);
      setShowExportOptions(null);
    }
  };

  const handleBulkExport = async () => {
    if (selectedForms.length === 0) return;
    
    setExportingId("bulk");
    try {
      let allSubmissions = [];
      for (const id of selectedForms) {
        const item = allTemplates.find(t => t._id === id);
        if (!item) continue;
        
        const res = await submissionApi.getSubmissions({ 
          templateId: item.isLegacy ? item._id : undefined,
          formId: !item.isLegacy ? item._id : undefined
        });
        
        const submissions = res.success ? res.data : (Array.isArray(res) ? res : []);
        allSubmissions.push(...submissions);
      }
      
      if (allSubmissions.length > 0) {
        const formattedData = formatSubmissionsForExport(allSubmissions);
        exportToExcel(formattedData, `Bulk_Form_Export`);
      } else {
        alert("No submission data found for selected templates.");
      }
    } catch (err) {
      console.error("Bulk export failed:", err);
      alert("Failed to export data.");
    } finally {
      setExportingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, templatesRes] = await Promise.all([
        formApi.getForms(),
        templateApi.getTemplates()
      ]);
      
      if (formsRes.success) {
        setForms(formsRes.data);
      } else {
        setForms(formsRes || []);
      }

      if (templatesRes.success) {
        setTemplates(templatesRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMultiFormLink = async () => {
    if (selectedForms.length === 0) {
      alert("Please select at least one template");
      return;
    }
    setIsApproverModalOpen(true);
  };

  const onConfirmApproval = async (approverId) => {
    try {
      const response = await assignmentApi.createTasks({
        formIds: selectedForms,
        assignedTo: approverId
      });

      if (response.success) {
        alert(`Form(s) assigned successfully to the employee!`);
        setSelectedForms([]);
        setIsApproverModalOpen(false);
      } else {
        alert(response.message || "Failed to assign forms");
      }
    } catch (err) {
      console.error("Failed to assign forms:", err);
      alert("Failed to assign forms");
    }
  };

  const toggleFormSelection = (formId) => {
    setSelectedForms(prev => 
      prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const handleClearSelection = () => {
    setSelectedForms([]);
  };

  const handleDeleteTemplate = async (item) => {
    const templateId = item._id;
    if (!confirm(`Are you sure you want to delete this ${item.isLegacy ? 'template' : 'form'}?`)) return;
    
    try {
      if (item.isLegacy) {
        await templateApi.deleteTemplate(templateId);
      } else {
        await formApi.deleteForm(templateId);
      }
      fetchData();
      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Failed to delete:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete";
      alert(errorMessage);
    }
  };

  const handleArchiveTemplate = async (item) => {
    const templateId = item._id;
    if (!confirm("Archive this? It will be hidden from employees but history is preserved.")) return;
    try {
      if (item.isLegacy) {
        await templateApi.archiveTemplate(templateId);
      } else {
        await formApi.updateForm(templateId, { status: 'ARCHIVED' });
      }
      fetchData();
      toast.success("Archived successfully");
    } catch (err) {
      console.error("Failed to archive:", err);
      alert("Failed to archive");
    }
  };

  const handleRestoreTemplate = async (item) => {
    const templateId = item._id;
    if (!confirm("Restore this? It will become available for use again.")) return;
    try {
      if (item.isLegacy) {
        await templateApi.restoreTemplate(templateId);
      } else {
        await formApi.updateForm(templateId, { status: 'PUBLISHED' });
      }
      fetchData();
      toast.success("Restored successfully");
    } catch (err) {
      console.error("Failed to restore:", err);
      alert("Failed to restore");
    }
  };

  const templateForms = forms.filter(f => isTemplateManagementEnabled ? f.isTemplate : !f.isTemplate);

  const allTemplates = isTemplateManagementEnabled 
    ? [
        ...templates.map(t => ({ ...t, isLegacy: true })),
        ...templateForms.map(f => ({ ...f, isLegacy: false }))
      ]
    : templateForms.map(f => ({ ...f, isLegacy: false }));

  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = (t.templateName || t.formName).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = 
      activeTab === "ARCHIVED" ? t.status === "ARCHIVED" :
      activeTab === "DRAFT" ? t.status === "DRAFT" :
      t.status !== "ARCHIVED" && t.status !== "DRAFT";
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status) => {
    const s = status || "APPROVED";
    switch (s) {
      case "DRAFT":
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase">Draft</span>;
      case "IN_APPROVAL":
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">In Approval</span>;
      case "APPROVED":
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Approved</span>;
        case "REJECTED":
          return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Rejected</span>;
        case "ARCHIVED":
          return <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-full uppercase">Archived</span>;
        default:
          return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">{s}</span>;
      }
    };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isTemplateManagementEnabled ? "Form Templates" : "Forms"}</h1>
          <p className="text-sm text-gray-500">
            {isTemplateManagementEnabled 
              ? "Create and manage your reusable form templates." 
              : "Create and distribute one-time forms to your employees."}
          </p>
        </div>
        <button
            onClick={() => {
              const now = new Date();
              const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
              const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
              setNewFormName(`New ${isTemplateManagementEnabled ? 'Template' : 'Form'} - ${dateStr} ${timeStr}`);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            {isTemplateManagementEnabled ? "Create Template" : "Create Form"}
          </button>
        </div>

          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("PUBLISHED")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                activeTab === "PUBLISHED"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("DRAFT")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                activeTab === "DRAFT"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Drafts
            </button>
          </div>


        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={isTemplateManagementEnabled ? "Search templates..." : "Search forms..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg border border-gray-100"></div>
          ))}
        </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-10">
                      <div 
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                          selectedForms.length === filteredTemplates.length && filteredTemplates.length > 0
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-gray-300 text-transparent'
                        }`}
                        onClick={() => {
                          if (selectedForms.length === filteredTemplates.length) {
                            setSelectedForms([]);
                          } else {
                            setSelectedForms(filteredTemplates.map(f => f._id));
                          }
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </th>
                                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {isTemplateManagementEnabled ? "Template Name" : "Form Name"}
                                      </th>

                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-100">
                  {filteredTemplates.map((item) => {
                    const isSelected = selectedForms.includes(item._id);
                    const isArchived = item.status === "ARCHIVED";
                    const name = item.templateName || item.formName;
                    const fieldCount = (item.fields?.length || item.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0)) || 0;

                    return (
                      <tr 
                        key={item._id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/30' : ''} ${isArchived ? 'opacity-60 bg-gray-50/50' : ''}`}
                        onClick={() => !isArchived && toggleFormSelection(item._id)}
                      >
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <div 
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                              isArchived ? 'bg-gray-200 border-gray-200 cursor-not-allowed' :
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                : 'bg-white border-gray-300 text-transparent'
                            }`}
                            onClick={() => !isArchived && toggleFormSelection(item._id)}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isArchived ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-600'}`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className={`font-semibold ${isArchived ? 'text-gray-500' : 'text-gray-900'}`}>{name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</div>
                              )}
                              {isArchived && item.archivedAt && (
                                <div className="text-[10px] text-gray-400 mt-0.5 italic">
                                  Archived on {formatDate(item.archivedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              {fieldCount} Fields
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span>{formatDate(item.createdAt).split(',')[0]}</span>
                            <span className="text-[10px] text-gray-400">{formatDate(item.createdAt).split(',')[1]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                          <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {!isArchived ? (
                                <>
                                  <div className="relative">
                                    <button
                                      onClick={() => setShowExportOptions(showExportOptions === item._id ? null : item._id)}
                                      disabled={exportingId === item._id}
                                      className={`p-2 rounded-lg transition-colors ${showExportOptions === item._id ? 'bg-indigo-100 text-indigo-700' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                      title="Export Options"
                                    >
                                      {exportingId === item._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                    </button>
                                    
                                        {showExportOptions === item._id && (
                                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden text-left p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Template Details</div>
                                          <button onClick={() => handleExportTemplateDetails(item)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Table className="w-3.5 h-3.5 text-green-600" /> Excel Format
                                          </button>

                                          <div className="h-px bg-gray-100 my-1" />
                                          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submission Data</div>
                                          <button onClick={() => handleExportTemplateData(item)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Table className="w-3.5 h-3.5 text-green-600" /> Excel Format
                                          </button>

                                          <div className="h-px bg-gray-100 my-1" />
                                          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Statistics</div>
                                          <button onClick={() => handleExportStats(item)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                            <Table className="w-3.5 h-3.5 text-green-600" /> Excel Format
                                          </button>
                                        </div>
                                      )}
                                  </div>
                                  {!item.isLegacy ? (

                                    <>
                                      <Link

                                      to={`/plant/forms/${item._id}/edit`}
                                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                      title="Edit Template"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Link>
                                    {isTemplateManagementEnabled && (
                                      <button
                                        onClick={() => {
                                          setSelectedForms([item._id]);
                                          setIsApproverModalOpen(true);
                                        }}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Assign Template"
                                      >
                                        <Users className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <Link
                                    to={`/plant/forms/create?template=${item._id}`}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Use Template"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Link>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestoreTemplate(item)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Restore"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteTemplate(item)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-20 bg-gray-50/30">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-gray-900 font-medium">No templates found</h3>
              <p className="text-gray-500 text-sm">Create a new template to get started.</p>
            </div>
          )}
        </div>
      )}

      <ActionBar 
        selectedCount={selectedForms.length}
        onClear={handleClearSelection}
        onExport={handleBulkExport}
        onAssign={isTemplateManagementEnabled ? handleSendMultiFormLink : undefined}
      />

      <ApproverSelectionModal 
        isOpen={isApproverModalOpen}
        onClose={() => setIsApproverModalOpen(false)}
        onConfirm={onConfirmApproval}
        selectedForms={
          [...templates.map(t => ({...t, isLegacy: true})), ...templateForms]
            .filter(f => selectedForms.includes(f._id))
        }
      />

      {isCreateModalOpen && (
        <Modal 
          title={isTemplateManagementEnabled ? "Create New Template" : "Create New Form"}
          onClose={() => {
            setIsCreateModalOpen(false);
            setNewFormName("");
          }}
        >
          <div className="space-y-4">
            <Input 
              label={isTemplateManagementEnabled ? "Template Name" : "Form Name"}
              value={newFormName} 
              onChange={setNewFormName} 
              placeholder={`Enter ${isTemplateManagementEnabled ? 'template' : 'form'} name...`}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewFormName("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
                <button
                  onClick={async () => {
                    if (!newFormName.trim()) {
                      alert(`Please enter a ${isTemplateManagementEnabled ? 'template' : 'form'} name`);
                      return;
                    }
                    
                    try {
                      setIsCreating(true);
                      const payload = {
                        formName: newFormName.trim(),
                        status: "DRAFT",
                        isTemplate: isTemplateManagementEnabled,
                        formId: newFormName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
                        plantId: user?.plantId,
                          sections: [{ sectionId: "section-1", title: "General Information", fields: [] }]

                      };
                      
                      const res = await formApi.createForm(payload);
                      const created = res?.data ?? res?.form;
                      if (res?.success && created?._id) {
                        setIsCreateModalOpen(false);
                        setNewFormName("");
                        navigate(`/plant/forms/${created._id}/edit/designer?isTemplate=${isTemplateManagementEnabled}`);
                      } else {
                        toast.error(res?.message || "Failed to create draft");
                      }
                    } catch (err) {
                      console.error("Create draft failed:", err);
                      const msg = err.response?.data?.message || err.message || "Failed to create draft";
                      toast.error(msg);
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  disabled={isCreating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isTemplateManagementEnabled ? "Create Template" : "Create Form"}
                </button>

            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
