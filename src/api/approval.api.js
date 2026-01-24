import api from "./api";

export const approvalApi = {
  // External links
  sendMultiFormLink: async (data) => {
    try {
      const response = await api.post("/approve/send-multi", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getFormByToken: async (token) => {
    try {
      const response = await api.get(`/approve/${token}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  submitFormByToken: async (token, data) => {
    try {
      const response = await api.post(`/approve/${token}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // Employee workflow
  getAssignedSubmissions: async () => {
    try {
      const response = await api.get("/approve/assigned/all");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  processApproval: async (approvalData) => {
    try {
      const response = await api.post("/approve/process", approvalData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getEmployeeStats: async () => {
    try {
      const response = await api.get("/approve/stats/employee");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // Internal Approval Tasks
  createApprovalTask: async (taskData) => {
    try {
      const response = await api.post("/approve/tasks", taskData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getApprovalTasks: async (status) => {
    try {
      const response = await api.get("/approve/tasks", { params: { status } });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getApprovalTaskDetails: async (id) => {
    try {
      const response = await api.get(`/approve/tasks/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }
};
