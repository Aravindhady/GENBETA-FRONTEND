import api from "./api";

export const assignmentApi = {
  getMyAssignments: async () => {
    try {
      const response = await api.get("/api/assignments/my");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getPlantAssignments: async () => {
    try {
      const response = await api.get("/api/assignments/plant");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  assignTemplate: async (assignmentData) => {
    try {
      const response = await api.post("/api/assignments/assign", assignmentData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getAssignmentById: async (id) => {
    try {
      const response = await api.get(`/api/assignments/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  deleteAssignment: async (id) => {
    try {
      const response = await api.delete(`/api/assignments/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  submitAssignment: async (id, data, files = []) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      files.forEach((file) => {
        formData.append(file.fieldId, file.file);
      });

      const response = await api.post(`/api/formTask/${id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  submitDirect: async (templateId, data, files = []) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));

      files.forEach((file) => {
        formData.append(file.fieldId, file.file);
      });

      const response = await api.post(`/api/form-task/submit-direct/${templateId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // Legacy/Compatibility methods
  getTaskStats: async () => {
    try {
      const response = await api.get("/api/assignments/my");
      if (response.data.success) {
        const assignments = response.data.data;
        return {
          success: true,
          data: {
            pendingCount: assignments.filter(a => a.status === 'PENDING').length,
            completedCount: assignments.filter(a => a.status === 'SUBMITTED').length
          }
        };
      }
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAssignedTasks: async () => {
    return assignmentApi.getMyAssignments();
  },

  getTaskById: async (id) => {
    return assignmentApi.getAssignmentById(id);
  },

  submitTask: async (id, data, files = []) => {
    return assignmentApi.submitAssignment(id, data, files);
  },

  createTasks: async (data) => {
    return assignmentApi.assignTemplate({
      templateIds: data.formIds, // Sending array of IDs
      employeeIds: [data.assignedTo],
      dueDate: data.dueDate
    });
  }
};
