import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/waste-invoice-types";

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
const wasteInvoiceTypeService = {
  // 🔹 Get all waste invoice types
  getAll: async () => {
    const response = await api.get("/");
    return response.data.wasteInvoiceTypes; // { wasteInvoiceTypes }
  },

  // 🔹 Get waste invoice type by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.wasteInvoiceType; // { wasteInvoiceType }
  },

  // 🔹 Create waste invoice type
  create: async (data) => {
    const payload = {
      code: Number(data.code),
      invoiceType: data.invoiceType,
      assessValue: data.assessValue ?? false,
      charity: data.charity ?? false,
      tax: data.tax ?? false,
      gst: data.gst ?? true,
      igst: data.igst ?? false,
      duty: data.duty ?? false,
      cess: data.cess ?? false,
      hrSecCess: data.hrSecCess ?? false,
      tcs: data.tcs ?? false,
      cst: data.cst ?? false,
      cenvat: data.cenvat ?? false,
      subTotal: data.subTotal ?? true,
      totalValue: data.totalValue ?? true,
      roundOff: data.roundOff ?? true,
      packingForwardingCharges: data.packingForwardingCharges ?? false,
      roundOffDigits: data.roundOffDigits ?? 0,
      gstPercentage: data.gstPercentage ?? 0,
      cgstPercentage: data.cgstPercentage ?? 0,
      sgstPercentage: data.sgstPercentage ?? 0,
    };

    const response = await api.post("/", payload);
    return response.data.wasteInvoiceType;
  },

  // 🔹 Update waste invoice type
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      invoiceType: data.invoiceType,
      assessValue: data.assessValue,
      charity: data.charity,
      tax: data.tax,
      gst: data.gst,
      igst: data.igst,
      duty: data.duty,
      cess: data.cess,
      hrSecCess: data.hrSecCess,
      tcs: data.tcs,
      cst: data.cst,
      cenvat: data.cenvat,
      subTotal: data.subTotal,
      totalValue: data.totalValue,
      roundOff: data.roundOff,
      packingForwardingCharges: data.packingForwardingCharges,
      roundOffDigits: data.roundOffDigits,
      gstPercentage: data.gstPercentage,
      cgstPercentage: data.cgstPercentage,
      sgstPercentage: data.sgstPercentage,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.wasteInvoiceType;
  },

  // 🔹 Delete waste invoice type
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default wasteInvoiceTypeService;
