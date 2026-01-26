import api from "./api";

export const submissionApi = {
  createSubmission: async (formId, data, files = [], status = "PENDING_APPROVAL", taskId = null) => {
    const formData = new FormData();
    formData.append("formId", formId);
    formData.append("data", JSON.stringify(data));
    formData.append("status", status);
    if (taskId) formData.append("taskId", taskId);

    files.forEach((file) => {
      formData.append(file.fieldId, file.file);
    });

    const response = await api.post("/api/submissions", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },

  getSubmissions: async (filters = {}) => {
    const response = await api.get("/api/submissions", { params: filters });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await api.get(`/api/submissions/${id}`);
    return response.data;
  },

  updateSubmissionStatus: async (id, status) => {
    const response = await api.patch(`/api/submissions/${id}/status`, { status });
    return response.data;
  },

  getTemplateAnalytics: async (templateId) => {
    const response = await api.get(`/api/submissions/template/${templateId}/analytics`);
    return response.data;
  }
};
