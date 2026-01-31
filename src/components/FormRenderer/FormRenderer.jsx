import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission.api";
import { 
  Save, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  FileText, 
  CheckCircle2,
  RotateCcw,
  Upload,
  Clock,
  UserCheck,
  ShieldCheck,
  CreditCard,
  ClipboardList
} from "lucide-react";
import SignaturePad from "../forms/ModernFormBuilder/components/SignaturePad";
import { useAuth } from "../../context/AuthContext";
import CompanyHeader from "../common/CompanyHeader";

export default function FormRenderer({ 
  form, 
  fields: externalFields, 
  onSubmit: externalOnSubmit, 
  onDataChange,
  submitting: externalSubmitting,
  initialData = {},
  readOnly = false
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(initialData);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  const fields = externalFields || form?.fields || [];
  const sections = form?.sections || [];
  const isLoading = externalSubmitting !== undefined ? externalSubmitting : loading;
  
  const update = (id, value) => {
    const fieldKey = id;
    const newData = { ...data, [fieldKey]: value };
    setData(newData);
    if (onDataChange) onDataChange(newData);
    if (errors[fieldKey]) setErrors({ ...errors, [fieldKey]: null });
  };

  const handleFileChange = (fieldId, file) => {
    if (file) {
      setFiles({ ...files, [fieldId]: { file, fieldId } });
      if (errors[fieldId]) setErrors({ ...errors, [fieldId]: null });
    }
  };

  const validateAll = () => {
    const newErrors = {};
    let hasError = false;

    // Validate fields from top level
    fields.forEach(field => {
      const fieldId = field.fieldId || field.id;
      if (field.required && !["section-header", "spacer", "description", "auto-date", "auto-user"].includes(field.type)) {
        const val = data[fieldId];
if (field.type === "file" || field.type === "image") {
            if (!files[fieldId] && !val) {
              newErrors[fieldId] = "This field is required";
              hasError = true;
            }
          } else if (field.type === "daterange") {
            if (!val || !val.start || !val.end) {
              newErrors[fieldId] = "Both start and end dates are required";
              hasError = true;
            }
          } else if (!val || (Array.isArray(val) && val.length === 0)) {
            newErrors[fieldId] = "This field is required";
            hasError = true;
          }
        }
      });

      // Validate fields from sections
      sections.forEach(section => {
        section.fields?.forEach(field => {
          const fieldId = field.fieldId || field.id;
          if (field.required && !["section-header", "spacer", "description", "auto-date", "auto-user"].includes(field.type)) {
            const val = data[fieldId];
            if (field.type === "file" || field.type === "image") {
              if (!files[fieldId] && !val) {
                newErrors[fieldId] = "This field is required";
                hasError = true;
              }
            } else if (field.type === "checklist") {
              const items = field.items || [];
              const responses = val || {};
              if (Object.keys(responses).length < items.length) {
                newErrors[fieldId] = "All checklist items must be completed";
                hasError = true;
              }
            } else if (field.type === "daterange") {
              if (!val || !val.start || !val.end) {
                newErrors[fieldId] = "Both start and end dates are required";
                hasError = true;
              }
            } else if (!val || (Array.isArray(val) && val.length === 0)) {
            newErrors[fieldId] = "This field is required";
            hasError = true;
          }
        }
      });
    });

    setErrors(newErrors);
    return !hasError;
  };


  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateAll()) return;

    if (externalOnSubmit) {
      await externalOnSubmit(data, Object.values(files));
      return;
    }

    setLoading(true);
    try {
      const fileArray = Object.values(files);
      const response = await submissionApi.createSubmission(form._id, data, fileArray, "PENDING_APPROVAL");
      if (response.success) {
        navigate("/employee/submissions");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, customKey) => {
    const fieldId = field.fieldId || field.id;
    const error = errors[fieldId];
    const val = data[fieldId];
    
    const alignmentClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    }[field.alignment || "left"];

    const widthStyle = { width: field.width || "100%" };

    const commonInput = `w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${error ? 'border-red-500 focus:ring-red-100' : 'border-slate-100 focus:border-indigo-500 focus:ring-indigo-100'}`;

    const fieldKey = customKey || fieldId;

    if (field.type === "section-header") {
      return (
        <div key={fieldKey} className={`py-6 border-b border-slate-100 mb-6 ${alignmentClass}`} style={widthStyle}>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{field.label}</h3>
          {field.description && <p className="text-sm text-slate-400 mt-2">{field.description}</p>}
        </div>
      );
    }

    if (field.type === "description") {
      return (
        <div key={fieldKey} className={`py-4 text-slate-500 leading-relaxed ${alignmentClass}`} style={widthStyle}>
          {field.content}
        </div>
      );
    }

    if (field.type === "spacer") {
      return <div key={fieldKey} style={{ ...widthStyle, height: field.height || "20px" }} />;
    }

    return (
      <div key={fieldKey} style={widthStyle} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
          <span>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>

        {field.type === "checklist" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100 mt-2">
            {field.items?.map((item, i) => (
              <div key={item.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50/50 transition-colors gap-4">
                <p className="flex-1 text-sm font-medium text-slate-700">{item.question}</p>
                <div className="flex gap-2 shrink-0">
                  {field.options?.map((opt, oi) => (
                    <button 
                      key={oi}
                      type="button"
                      disabled={readOnly}
                      onClick={() => {
                        const currentVal = val || {};
                        update(fieldId, { ...currentVal, [item.id || `item-${i}`]: opt });
                      }}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-tighter ${val?.[item.id || `item-${i}`] === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-500'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {field.type === "text" && (
          <input type="text" disabled={readOnly} className={commonInput} value={val || ""} onChange={(e) => update(fieldId, e.target.value)} placeholder={field.placeholder} />
        )}

        {field.type === "number" && (
          <input type="number" disabled={readOnly} className={commonInput} value={val || ""} onChange={(e) => update(fieldId, e.target.value)} placeholder={field.placeholder} />
        )}

        {field.type === "email" && (
          <input type="email" disabled={readOnly} className={commonInput} value={val || ""} onChange={(e) => update(fieldId, e.target.value)} placeholder={field.placeholder} />
        )}

        {field.type === "phone" && (
          <input type="tel" disabled={readOnly} className={commonInput} value={val || ""} onChange={(e) => update(fieldId, e.target.value)} placeholder={field.placeholder} />
        )}

{field.type === "date" && (
            <input type="date" disabled={readOnly} className={commonInput} value={val || ""} onChange={(e) => update(fieldId, e.target.value)} />
          )}

          {field.type === "daterange" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                <input 
                  type="date" 
                  disabled={readOnly} 
                  className={commonInput} 
                  value={val?.start || ""} 
                  onChange={(e) => update(fieldId, { ...val, start: e.target.value })} 
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                <input 
                  type="date" 
                  disabled={readOnly} 
                  className={commonInput} 
                  value={val?.end || ""} 
                  onChange={(e) => update(fieldId, { ...val, end: e.target.value })} 
                />
              </div>
            </div>
          )}

        {field.type === "dropdown" && (
          <select disabled={readOnly} className={commonInput} value={val || ""} onChange={(e) => update(fieldId, e.target.value)}>
            <option value="">{field.placeholder || "Select option"}</option>
            {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        )}

        {field.type === "radio" && (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${val === opt ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <input type="radio" disabled={readOnly} checked={val === opt} onChange={() => update(fieldId, opt)} className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === "checkbox" && (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${(val || []).includes(opt) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <input 
                  type="checkbox" 
                  disabled={readOnly} 
                  checked={(val || []).includes(opt)} 
                  onChange={(e) => {
                    const arr = val || [];
                    update(fieldId, e.target.checked ? [...arr, opt] : arr.filter(o => o !== opt));
                  }} 
                  className="w-4 h-4 text-indigo-600 rounded" 
                />
                <span className="font-medium text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {(field.type === "file" || field.type === "image") && (
            <div className="space-y-3">
              {!readOnly && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                    {field.type === 'image' ? <CreditCard size={24} className="mb-2" /> : <Upload size={24} className="mb-2" />}
                    <p className="text-sm">Click to upload {field.type}</p>
                  </div>
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(fieldId, e.target.files[0])} />
                </label>
              )}
              
              {field.type === "image" && val && (
                <div className="relative group">
                  <img 
                    src={val} 
                    alt={field.label} 
                    className="w-full max-h-64 object-contain rounded-2xl border-2 border-slate-100 bg-slate-50 p-2 shadow-inner" 
                  />
                  <a 
                    href={val} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg text-indigo-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <FileText size={16} />
                  </a>
                </div>
              )}

              {field.type === "file" && val && (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-700 truncate">
                      {files[fieldId]?.file?.name || "Uploaded File"}
                    </p>
                    <p className="text-xs text-indigo-500">Click to download or preview</p>
                  </div>
                  <a 
                    href={val} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Download
                  </a>
                </div>
              )}

              {files[fieldId] && !val && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700 truncate flex-1">
                    {files[fieldId]?.file.name}
                  </span>
                </div>
              )}
            </div>
          )}

        {field.type === "signature" && (
          <div className="space-y-2">
            {val ? (
              <div className="relative group">
                <div className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img 
                    src={val} 
                    alt="Signature" 
                    className="max-w-full max-h-full object-contain p-4" 
                  />
                </div>
                {!readOnly && (
                  <button 
                    type="button"
                    onClick={() => update(fieldId, null)}
                    className="absolute top-3 right-3 p-2 bg-white shadow-lg rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                    title="Clear signature to sign again"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            ) : (
              <SignaturePad 
                value={val} 
                onChange={(v) => update(fieldId, v)} 
                readOnly={readOnly} 
                label={field.label} 
              />
            )}
            {val && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest px-1">
                <CheckCircle2 size={12} />
                Digitally Signed & Verified
              </div>
            )}
          </div>
        )}

        {field.type === "terms" && (
          <div className="flex gap-3 p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl">
            <input type="checkbox" disabled={readOnly} checked={!!val} onChange={(e) => update(fieldId, e.target.checked)} className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300" />
            <p className="text-[13px] text-slate-600 leading-snug break-words overflow-hidden">{field.content}</p>
          </div>
        )}

        {field.type === "auto-date" && (
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Submission Date</span>
            </div>
            <span className="text-xs font-mono text-slate-600">{new Date().toLocaleDateString()}</span>
          </div>
        )}

        {field.type === "auto-user" && (
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400">
              <UserCheck size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">User Verified</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-slate-600">{user?.name}</span>
              <span className="text-[9px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-400 uppercase">{user?.role}</span>
            </div>
          </div>
        )}

          {field.type === "grid-table" && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <div className={(field.columns?.length || 0) > 6 ? "min-w-[800px]" : "w-full"}>
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {field.columns?.map(col => (
                          <th 
                            key={col.id} 
                            style={{ minWidth: col.width || '120px' }} 
                            className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-widest text-[10px] border-r last:border-0 border-slate-200/50"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {(val || Array(field.rows || 1).fill({})).map((row, ri) => (
                        <tr key={ri} className="border-b border-slate-100 last:border-0">
                          {field.columns?.map(col => (
                            <td key={col.id} className="px-2 py-2 border-r last:border-0 border-slate-100">
                              <input
                                type="text"
                                disabled={readOnly}
                                className="w-full px-2 py-1.5 border border-transparent focus:border-indigo-500 focus:bg-indigo-50/30 outline-none rounded-lg transition-all"
                                value={row[col.id] || ""}
                                onChange={(e) => {
                                  const newTable = [...(val || Array(field.rows || 1).fill({}))];
                                  newTable[ri] = { ...newTable[ri], [col.id]: e.target.value };
                                  update(fieldId, newTable);
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {(field.columns?.length || 0) > 6 && (
                <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Scroll horizontally to see all columns</span>
                </div>
              )}

              {field.repeatable && !readOnly && (
                <button 
                  type="button"
                  onClick={() => {
                    const newTable = [...(val || Array(field.rows || 1).fill({}))];
                    newTable.push({});
                    update(fieldId, newTable);
                  }}
                  className="w-full py-2.5 bg-slate-50/50 text-[10px] font-black text-slate-400 hover:text-indigo-600 hover:bg-white transition-all border-t border-slate-200 uppercase tracking-widest"
                >
                  + ADD NEW ROW
                </button>
              )}
            </div>
          )}

        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-red-600 text-xs font-semibold">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Default Company Header */}
      <CompanyHeader />

      {/* Form Title Section */}
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-3">
          <ClipboardList size={14} className="text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Form Template</span>
        </div>
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight leading-none">
          {form?.title || form?.name || 'Untitled Form'}
        </h1>
        {form?.description && (
          <p className="mt-3 text-slate-500 font-medium max-w-2xl">
            {form.description}
          </p>
        )}
      </div>

      {/* Workflow Info Section */}
      {form?.approvalFlow && form.approvalFlow.length > 0 && (
        <div className="mb-10 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Approval Workflow</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
              {form.approvalFlow.length} LEVELS
            </span>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              {form.approvalFlow.map((level, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black shadow-sm">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{level.name}</span>
                    <span className="text-sm font-bold text-slate-700 leading-none">
                      {level.approverId?.name || level.approverId?.email || "Pending Assignment"}
                    </span>
                  </div>
                  {idx !== form.approvalFlow.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-200 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {/* Render Sections if they exist */}
        {sections.length > 0 ? (
          sections.map((section, sidx) => (
            <div key={section.sectionId || sidx} className="space-y-6">
              <div className="border-l-4 border-indigo-600 pl-4 py-2 bg-slate-50/50 rounded-r-xl">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{section.title}</h2>
                {section.description && <p className="text-sm text-slate-500 mt-1">{section.description}</p>}
              </div>
              <div className="space-y-6">
                {(section.fields || []).map((field, fidx) => renderField(field, field.fieldId || `field-${sidx}-${fidx}`))}
              </div>
            </div>
          ))
        ) : (
          /* Fallback to flat fields */
          <div className="space-y-6">
            {fields.map((field, index) => {
              if (field.type === "columns-2" || field.type === "columns-3") {
                const cols = field.type === "columns-2" ? 2 : 3;
                return (
                  <div key={field.id || `field-${index}`} className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
                    {field.children?.map((colFields, ci) => (
                      <div key={ci} className="space-y-6">
                        {colFields.map((f, fi) => renderField(f, f.id || `col-${ci}-${fi}`))}
                      </div>
                    ))}
                  </div>
                );
              }
              return renderField(field, field.id || `field-${index}`);
            })}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="mt-12 flex justify-end gap-4">
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> SUBMIT FORM</>}
          </button>
        </div>
      )}
    </div>
  );
}
