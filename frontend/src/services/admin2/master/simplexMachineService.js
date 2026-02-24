// src/services/admin2/master/simplexMachineService.js
// (or wherever you keep your API service files)

import axios from "axios";

const API_URL = "http://localhost:5000/api/admin2/master/simplex-machines";
// Adjust port and base path if your backend uses something different

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Automatically add Bearer token from localStorage (same as your other services)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const simplexMachineService = {
  // Get all simplex machines
  getAll: async () => {
    const res = await api.get("/");
    return res.data.simplexMachines;   // matches what controller sends: { simplexMachines: [...] }
  },

  // Get one machine by ID
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.simplexMachine;    // matches { simplexMachine: { ... } }
  },

  // Create new simplex machine
  create: async (data) => {
    const payload = {
      mcNo: data.mcNo.trim(),
      mcId: data.mcId.trim(),
      description: data.description ? data.description.trim() : null,
      feedHank: parseFloat(data.feedHank),
    };

    const res = await api.post("/", payload);
    return res.data.simplexMachine;
  },

  // Update existing machine (partial update — only send changed fields)
  update: async (id, data) => {
    const payload = {};

    if (data.mcNo !== undefined) {
      payload.mcNo = data.mcNo.trim();
    }
    if (data.mcId !== undefined) {
      payload.mcId = data.mcId.trim();
    }
    if ("description" in data) {
      payload.description = data.description ? data.description.trim() : null;
    }
    if (data.feedHank !== undefined) {
      payload.feedHank = parseFloat(data.feedHank);
    }

    const res = await api.put(`/${id}`, payload);
    return res.data.simplexMachine;
  },

  // Delete machine
  delete: async (id) => {
    await api.delete(`/${id}`);
    return true;
  },
};

export default simplexMachineService;