import axios from "axios";

const API_URL = "http://localhost:5000/api/admin2/master/spinning-counts";  // adjust port/base if needed

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const spinningCountService = {
  getAll: async () => {
    const res = await api.get("/");
    return res.data.spinningCounts;
  },

  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.spinningCount;
  },

  create: async (data) => {
    const payload = {
      countName: data.countName.trim(),
      ActCount: parseFloat(data.ActCount),
      Noils: parseFloat(data.Noils),
    };
    const res = await api.post("/", payload);
    return res.data.spinningCount;
  },

  update: async (id, data) => {
    const payload = {};
    if (data.countName !== undefined) payload.countName = data.countName.trim();
    if (data.ActCount !== undefined) payload.ActCount = parseFloat(data.ActCount);
    if (data.Noils !== undefined) payload.Noils = parseFloat(data.Noils);

    const res = await api.put(`/${id}`, payload);
    return res.data.spinningCount;
  },

  delete: async (id) => {
    await api.delete(`/${id}`);
    return true;
  },
};

export default spinningCountService;