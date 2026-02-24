import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/packing-types";

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
    const token = localStorage.getItem("token"); // saved after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Service methods (MATCHES YOUR BACKEND)
const packingTypeService = {
  // 🔹 Get all packing types
  getAll: async () => {
    const response = await api.get("/");
    return response.data.packingTypes; // { packingTypes }
  },

  // 🔹 Get packing type by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.packingType; // { packingType }
  },

  // 🔹 Get next available code
  getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },

  // 🔹 Create packing type
  create: async (data) => {
    const payload = {
      code: Number(data.code), // ensure INTEGER
      name: data.name,
      tareWeight: parseFloat(data.tareWeight) || 0, // ensure DECIMAL with default
      rate: parseFloat(data.rate) || 0, // ensure DECIMAL with default
    };

    const response = await api.post("/", payload);
    return response.data.packingType;
  },

  // 🔹 Update packing type
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      name: data.name !== undefined ? data.name : undefined,
      tareWeight: data.tareWeight !== undefined ? parseFloat(data.tareWeight) : undefined,
      rate: data.rate !== undefined ? parseFloat(data.rate) : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.packingType;
  },

  // 🔹 Delete packing type
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default packingTypeService;