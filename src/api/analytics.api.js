import api from "./api";

export const analyticsApi = {
  // Get comprehensive dashboard analytics
  getDashboardAnalytics: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/analytics/dashboard", { params });
    return response.data;
  },

  // Get submissions per day
  getSubmissionsPerDay: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/analytics/submissions-per-day", { params });
    return response.data;
  },

  // Get average approval time
  getAverageApprovalTime: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/analytics/average-approval-time", { params });
    return response.data;
  },

  // Get rejection rate
  getRejectionRate: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/analytics/rejection-rate", { params });
    return response.data;
  },

  // Get pending by stage
  getPendingByStage: async (plantId = null, companyId = null) => {
    const params = {};
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/analytics/pending-by-stage", { params });
    return response.data;
  },

    // Get plant-wise statistics
    getPlantWiseStats: async (companyId = null) => {
      const params = {};
      if (companyId) params.companyId = companyId;
      
      const response = await api.get("/analytics/plant-wise-stats", { params });
      return response.data;
    },

    // Get approvals by employee
    getApprovalsByEmployee: async (days = 30, plantId = null, companyId = null) => {
      const params = { days };
      if (plantId) params.plantId = plantId;
      if (companyId) params.companyId = companyId;
      
      const response = await api.get("/analytics/approvals-by-employee", { params });
      return response.data;
    }
  };

