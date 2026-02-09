// frontend/src/services/invoiceService.js

import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/invoices";

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

// ✅ Service methods (MATCHES YOUR INVOICE BACKEND)
const invoiceService = {
  // 🔹 Get all invoices
  getAll: async () => {
    const response = await api.get("/");
    return response.data.invoices; // { invoices }
  },

  // 🔹 Get invoice by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.invoice; // { invoice }
  },

  // 🔹 Create invoice
  create: async (data) => {
    const payload = {
      invoiceNo: data.invoiceNo?.trim(),
      date: data.date,
      invoiceType: data.invoiceType?.trim(),
      partyName: data.partyName?.trim(),
      address: data.address?.trim(),
      assessableValue: Number(data.assessableValue) || 0,
      charity: Number(data.charity) || 0,
      vatTax: Number(data.vatTax) || 0,
      cenvat: Number(data.cenvat) || 0,
      duty: Number(data.duty) || 0,
      cess: Number(data.cess) || 0,
      hsCess: Number(data.hsCess) || 0,
      tcs: Number(data.tcs) || 0,
      pfCharges: Number(data.pfCharges) || 0,
      subTotal: Number(data.subTotal) || 0,
      roundOff: Number(data.roundOff) || 0,
      invoiceValue: Number(data.invoiceValue) || 0,
      gst: Number(data.gst) || 0,
      igst: Number(data.igst) || 0,
      creditDays: Number(data.creditDays) || 0,
      interestPercent: Number(data.interestPercent) || 0,
      transport: data.transport?.trim() || null,
      lrNo: data.lrNo?.trim() || null,
      lrDate: data.lrDate || null,
      vehicleNo: data.vehicleNo?.trim() || null,
      removalTime: data.removalTime || null,
      eBill: data.eBill?.trim() || null,
      exportTo: data.exportTo?.trim() || null,
      approve: data.approve === true, // boolean
      salesOrderId: data.salesOrderId ? Number(data.salesOrderId) : null,

      details: (data.details || []).map((item) => ({
        wasteName: item.wasteName?.trim(),
        lotNo: item.lotNo?.trim(),
        baleNo: item.baleNo?.trim(),
        grossWt: Number(item.grossWt) || 0,
        tareWt: Number(item.tareWt) || 0,
        netWt: Number(item.netWt) || 0,
      })),
    };

    const response = await api.post("/", payload);
    return response.data.invoice;
  },

  // 🔹 Update invoice
  update: async (id, data) => {
    const payload = {
      invoiceNo:
        data.invoiceNo !== undefined ? data.invoiceNo?.trim() : undefined,
      date:
        data.date !== undefined ? data.date : undefined,
      invoiceType:
        data.invoiceType !== undefined ? data.invoiceType?.trim() : undefined,
      partyName:
        data.partyName !== undefined ? data.partyName?.trim() : undefined,
      address:
        data.address !== undefined ? data.address?.trim() : undefined,
      assessableValue:
        data.assessableValue !== undefined ? Number(data.assessableValue) : undefined,
      charity:
        data.charity !== undefined ? Number(data.charity) : undefined,
      vatTax:
        data.vatTax !== undefined ? Number(data.vatTax) : undefined,
      cenvat:
        data.cenvat !== undefined ? Number(data.cenvat) : undefined,
      duty:
        data.duty !== undefined ? Number(data.duty) : undefined,
      cess:
        data.cess !== undefined ? Number(data.cess) : undefined,
      hsCess:
        data.hsCess !== undefined ? Number(data.hsCess) : undefined,
      tcs:
        data.tcs !== undefined ? Number(data.tcs) : undefined,
      pfCharges:
        data.pfCharges !== undefined ? Number(data.pfCharges) : undefined,
      subTotal:
        data.subTotal !== undefined ? Number(data.subTotal) : undefined,
      roundOff:
        data.roundOff !== undefined ? Number(data.roundOff) : undefined,
      invoiceValue:
        data.invoiceValue !== undefined ? Number(data.invoiceValue) : undefined,
      gst:
        data.gst !== undefined ? Number(data.gst) : undefined,
      igst:
        data.igst !== undefined ? Number(data.igst) : undefined,
      creditDays:
        data.creditDays !== undefined ? Number(data.creditDays) : undefined,
      interestPercent:
        data.interestPercent !== undefined ? Number(data.interestPercent) : undefined,
      transport:
        data.transport !== undefined ? data.transport?.trim() : undefined,
      lrNo:
        data.lrNo !== undefined ? data.lrNo?.trim() : undefined,
      lrDate:
        data.lrDate !== undefined ? data.lrDate : undefined,
      vehicleNo:
        data.vehicleNo !== undefined ? data.vehicleNo?.trim() : undefined,
      removalTime:
        data.removalTime !== undefined ? data.removalTime : undefined,
      eBill:
        data.eBill !== undefined ? data.eBill?.trim() : undefined,
      exportTo:
        data.exportTo !== undefined ? data.exportTo?.trim() : undefined,
      approve:
        data.approve !== undefined ? (data.approve === true) : undefined,
      salesOrderId:
        data.salesOrderId !== undefined
          ? data.salesOrderId
            ? Number(data.salesOrderId)
            : null
          : undefined,

      details:
        data.details !== undefined
          ? (data.details || []).map((item) => ({
              wasteName: item.wasteName?.trim(),
              lotNo: item.lotNo?.trim(),
              baleNo: item.baleNo?.trim(),
              grossWt: Number(item.grossWt) || 0,
              tareWt: Number(item.tareWt) || 0,
              netWt: Number(item.netWt) || 0,
            }))
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.invoice;
  },

  // 🔹 Delete invoice
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default invoiceService;