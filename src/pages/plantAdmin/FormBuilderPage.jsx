import ModernFormBuilder from "../../components/forms/ModernFormBuilder";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function FormBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Priority: 1. Query Param, 2. Company Setting, 3. Default True
  const isTemplateParam = searchParams.get("isTemplate");
  const isTemplate = isTemplateParam !== null 
    ? isTemplateParam === "true" 
    : (user?.isTemplateManagementEnabled ?? true);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between px-4">
        <button 
          onClick={() => navigate("/plant/forms")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-semibold group"
        >
          <div className="p-1.5 bg-white border border-slate-200 rounded-lg group-hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to {isTemplate ? "Templates" : "Forms"}
        </button>
      </div>

      <ModernFormBuilder formId={id} isTemplate={isTemplate} />
    </div>
  );
}
