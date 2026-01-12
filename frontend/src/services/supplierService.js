import axios from "axios";

// ✅ Base URL
const API_URL = "http://localhost:5000/api/suppliers";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token
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

const supplierService = {
  // 🔹 Get all suppliers
  getAll: async () => {
    const response = await api.get("/");
    return response.data.suppliers;
  },

  // 🔹 Get supplier by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.supplier;
  },

  // 🔹 Create supplier
  create: async (data) => {
    const payload = {
      code: data.code?.trim(),
      accountGroup: data.accountGroup?.trim(),
      accountName: data.accountName?.trim(),
      place: data.place?.trim(),
      address: data.address,
      deliveryAddress: data.deliveryAddress,
      pincode: data.pincode,
      stateId: data.stateId ? Number(data.stateId) : null, // 🔑 FK
      tinNo: data.tinNo?.trim(),
      cstNo: data.cstNo?.trim(),
      gstNo: data.gstNo?.trim(),
      phoneNo: data.phoneNo?.trim(),
      cellNo: data.cellNo?.trim(),
      email: data.email?.trim(),
      website: data.website?.trim(),
      contactPerson: data.contactPerson?.trim(),
      fax: data.fax?.trim(),
      accountNo: data.accountNo?.trim(),
      openingCredit: Number(data.openingCredit || 0),
      openingDebit: Number(data.openingDebit || 0),
    };

    const response = await api.post("/", payload);
    return response.data.supplier;
  },

  // 🔹 Update supplier
  update: async (id, data) => {
    const payload = {
      code: data.code?.trim(),
      accountGroup: data.accountGroup?.trim(),
      accountName: data.accountName?.trim(),
      place: data.place?.trim(),
      address: data.address,
      deliveryAddress: data.deliveryAddress,
      pincode: data.pincode,
      stateId: data.stateId !== undefined ? Number(data.stateId) : undefined,
      tinNo: data.tinNo?.trim(),
      cstNo: data.cstNo?.trim(),
      gstNo: data.gstNo?.trim(),
      phoneNo: data.phoneNo?.trim(),
      cellNo: data.cellNo?.trim(),
      email: data.email?.trim(),
      website: data.website?.trim(),
      contactPerson: data.contactPerson?.trim(),
      fax: data.fax?.trim(),
      accountNo: data.accountNo?.trim(),
      openingCredit:
        data.openingCredit !== undefined
          ? Number(data.openingCredit)
          : undefined,
      openingDebit:
        data.openingDebit !== undefined
          ? Number(data.openingDebit)
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.supplier;
  },

  // 🔹 Delete supplier
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default supplierService;
