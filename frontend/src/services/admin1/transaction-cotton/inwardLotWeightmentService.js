// services/weightmentService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/weightments";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const weightmentService = {
  create: async (data) => {
    const response = await api.post("/", data);
    return response.data.weightment;
  },

  getByInwardLotId: async (inwardLotId) => {
    const response = await api.get(`/inward-lot/${inwardLotId}`);
    return response.data.weightments;
  },

  update: async (id, data) => {
    const response = await api.put(`/${id}`, data);
    return response.data.weightment;
  },

  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};

export default weightmentService;