import api from "./api";

export const formApi = {
  getForms: async () => {
    const response = await api.get("/forms");
    return response.data;
  },
  getFormById: async (id) => {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },
  createForm: async (formData) => {
    const response = await api.post("/forms", formData);
    return { ...response.data, success: true };
  },
  updateForm: async (id, formData) => {
    const response = await api.put(`/forms/${id}`, formData);
    return { ...response.data, success: true };
  },
  deleteForm: async (id) => {
    const response = await api.delete(`/forms/${id}`);
    return { ...response.data, success: true };
  },
  sendLink: async (formId, email) => {
    const response = await api.post(`/forms/${formId}/send-link`, { approverEmail: email });
    return response.data;
  },
  sendMultiFormLink: async (formIds, email) => {
    const response = await api.post("/approve/send-multi", { formIds, approverEmail: email });
    return response.data;
  }
};
