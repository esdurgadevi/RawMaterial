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

// ✅ Service methods (MATCHES YOUR WASTE ENTRY BACKEND)
const wasteEntryService = {
  // 🔹 Get all waste entries
  getAll: async () => {
    const response = await api.get("/");
    return response.data.entries; // { entries }
  },

  // 🔹 Get waste entry by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.entry; // { entry }
  },

  // 🔹 Create waste entry
  create: async (data) => {
    const payload = {
      date: data.date, // "YYYY-MM-DD"
      shift: data.shift?.trim() || "ALL",
      remarks: data.remarks?.trim() || null,

      details: (data.details || []).map((item) => ({
        department: item.department?.trim(),
        wasteType: item.wasteType?.trim(),
        packingType: item.packingType?.trim(),
        netWeight: Number(item.netWeight) || 0,
        godown: item.godown?.trim(),
      })),
    };

    const response = await api.post("/", payload);
    return response.data.entry;
  },

  // 🔹 Update waste entry
  update: async (id, data) => {
    const payload = {
      date: data.date !== undefined ? data.date : undefined,
      shift: data.shift !== undefined ? data.shift?.trim() : undefined,
      remarks: data.remarks !== undefined ? data.remarks?.trim() : undefined,

      details:
        data.details !== undefined
          ? (data.details || []).map((item) => ({
              department: item.department?.trim(),
              wasteType: item.wasteType?.trim(),
              packingType: item.packingType?.trim(),
              netWeight: Number(item.netWeight) || 0,
              godown: item.godown?.trim(),
            }))
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.entry;
  },

  // 🔹 Delete waste entry
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default wasteEntryService;