// frontend/src/services/wasteEntryService.js

import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/waste-entries";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token automatically
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

// ✅ Waste Entry Service
const wasteEntryService = {
  // --------------------------------------------------
  // 🔹 Get all waste entries
  // --------------------------------------------------
  getAll: async () => {
    const response = await api.get("/");
    console.log(response);
    return response.data.entries;
  },

  // --------------------------------------------------
  // 🔹 Get waste entry by ID
  // --------------------------------------------------
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.entry;
  },

  create: async (data) => {
    const payload = {
      date: data.date,
      shift: data.shift?.trim() || "ALL",
      remarks: data.remarks?.trim() || null,

      details: (data.details || []).map((item) => ({
        // ✅ reference IDs instead of strings
        department: item.department?.trim(),
        wasteMasterId: Number(item.wasteMasterId),
        packingTypeId: Number(item.packingTypeId),
        godownId: Number(item.godownId),
        netWeight: Number(item.netWeight) || 0,
      })),
    };
    console.log(payload);
    
    const response = await api.post("/", payload);
    console.log(response);
    return response.data.entry;
  },

  // --------------------------------------------------
  // 🔹 Update waste entry
  // --------------------------------------------------
  update: async (id, data) => {
    const payload = {
      date: data.date ?? undefined,
      shift:
        data.shift !== undefined
          ? data.shift?.trim()
          : undefined,
      remarks:
        data.remarks !== undefined
          ? data.remarks?.trim()
          : undefined,

      details:
        data.details !== undefined
          ? (data.details || []).map((item) => ({
              department: item.department?.trim(),
              wasteMasterId: Number(item.wasteMasterId),
              packingTypeId: Number(item.packingTypeId),
              godownId: Number(item.godownId),
              netWeight: Number(item.netWeight) || 0,
            }))
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.entry;
  },

  // --------------------------------------------------
  // 🔹 Delete waste entry
  // --------------------------------------------------
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default wasteEntryService;
