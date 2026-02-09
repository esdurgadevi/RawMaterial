// frontend/src/services/wastePackingService.js

import axios from "axios";

// ✅ Backend base URL (adjust if your API prefix is different)
const API_URL = "http://localhost:5000/api/waste-packings";

// ✅ Axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Automatically attach JWT token from localStorage
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

// ✅ Service methods (matches your backend exactly)
const wastePackingService = {
  // 🔹 Get all waste packings
  getAll: async () => {
    const response = await api.get("/");
    return response.data.packings; // returns array of packings with details
  },

  // 🔹 Get single waste packing by ID (includes details)
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.packing; // single object with .details array
  },

  // 🔹 Create new waste packing (header + all details in one go)
  create: async (data) => {
    // Ensure correct number types (especially weights)

    const payload = {
      wasteType: data.wasteType?.trim(),
      date: data.date, // should be "YYYY-MM-DD" string or Date
      lotNo: data.lotNo?.trim(),
      stock: Number(data.stock) || 0,
      packingType: data.packingType?.trim(),
      noOfBales: Number(data.noOfBales),
      totalWeight: Number(data.totalWeight), // or parseFloat if needed
      details: (data.details || []).map((item) => ({
        baleNo: item.baleNo?.trim(),
        grossWeight: Number(item.grossWeight) || 0,
        tareWeight: Number(item.tareWeight) || 0,
        netWeight: Number(item.netWeight) || 0,
      })),
    };
    console.log(payload);
    const response = await api.post("/", payload);
    return response.data.packing; // returns created record with details
  },

  // 🔹 Update existing waste packing (full replace of details)
  update: async (id, data) => {
    const payload = {
      wasteType: data.wasteType?.trim(),
      date: data.date,
      lotNo: data.lotNo?.trim(),
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
      packingType: data.packingType?.trim(),
      noOfBales: data.noOfBales !== undefined ? Number(data.noOfBales) : undefined,
      totalWeight: data.totalWeight !== undefined ? Number(data.totalWeight) : undefined,
      details: (data.details || []).map((item) => ({
        baleNo: item.baleNo?.trim(),
        grossWeight: Number(item.grossWeight) || 0,
        tareWeight: Number(item.tareWeight) || 0,
        netWeight: Number(item.netWeight) || 0,
      })),
    };

    // Optional: clean up undefined fields if your form sends them
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    const response = await api.put(`/${id}`, payload);
    return response.data.packing;
  },

  // 🔹 Delete waste packing (cascades to details)
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message: "Waste packing deleted successfully" }
  },
};

export default wastePackingService;