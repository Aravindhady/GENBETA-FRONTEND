import { useState, useEffect } from "react";
import { ClipboardList, Search, Clock, FileText, ChevronRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { assignmentApi } from "../../api/assignment.api";

export default function EmployeeAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentApi.getMyAssignments();
      if (response.success) {
        setAssignments(response.data);
      } else {
        toast.error(response.message || "Failed to fetch assignments");
      }
    } catch (error) {
      toast.error("An error occurred while fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const name = a.templateId?.templateName || a.templateId?.formName || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-sm text-gray-500">Form templates specifically assigned to you.</p>
        </div>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search assigned forms..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <Link
              key={assignment._id}
              to={`/employee/fill-assignment/${assignment._id}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors"></div>
              
              <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    {assignment.status === "FILLED" ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" />
                        Filled
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {assignment.templateId?.templateName || assignment.templateId?.formName || "Untitled Template"}
                </h3>
                
                {assignment.templateId?.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{assignment.templateId.description}</p>
                )}
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Assigned: {new Date(assignment.createdAt).toLocaleDateString()}
                  </div>
                  {assignment.dueDate && (
                    <div className={`flex items-center gap-2 text-xs font-bold ${new Date(assignment.dueDate) < new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {assignment.status === "FILLED" ? "Already Filled" : "Start Filling"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No assigned forms</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don't have any forms specifically assigned to you at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
