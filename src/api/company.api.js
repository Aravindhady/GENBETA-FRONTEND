import api from "./api";

export const companyApi = {
  getCompanies: async () => {
    const response = await api.get("/api/companies");
    return response.data.data || response.data;
  },
  getCompanyById: async (id) => {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  },
  updateTemplateFeature: async (companyId, enabled) => {
    console.log("Calling updateTemplateFeature API:", { companyId, enabled });
    try {
      const response = await api.put("/api/companies/template-feature", { companyId, enabled });
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
};
