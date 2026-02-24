import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/inward-entries";

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

const inwardEntryService = {
  getNextInwardNo: async () => {
    const response = await api.get("/next-inward-no");
    return response.data.nextNo;
  },

  /* =============================
     GET ALL INWARD ENTRIES
  ============================= */
  getAll: async () => {
    const response = await api.get("/");
    return response.data.inwardEntries;
  },

  /* =============================
     GET BY ID
  ============================= */
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.inwardEntry;
  },

  /* =============================
     CREATE INWARD ENTRY
  ============================= */
  create: async (data) => {
    const payload = {
      inwardNo: data.inwardNo,
      inwardDate: data.inwardDate, // REQUIRED

      purchaseOrderId:
        data.purchaseOrderId !== undefined
          ? Number(data.purchaseOrderId)
          : null,

      godownId:
        data.godownId !== undefined ? Number(data.godownId) : null,

      orderNo: data.orderNo || null,
      lcNo: data.lcNo || null,
      paymentDays:
        data.paymentDays !== undefined ? Number(data.paymentDays) : null,
      paymentDate: data.paymentDate || null,
      govtForm: data.govtForm || null,
      type: data.type || null,

      billNo: data.billNo || null,
      billDate: data.billDate || null,
      lotNo: data.lotNo || null,
      lorryNo: data.lorryNo || null,

      candyRate:
        data.candyRate !== undefined ? Number(data.candyRate) : null,
      pMark: data.pMark || null,
      pressRunningNo: data.pressRunningNo || null,
      commisType: data.commisType || null,
      commisValue:
        data.commisValue !== undefined ? Number(data.commisValue) : null,

      balesQty:
        data.balesQty !== undefined ? Number(data.balesQty) : null,

      freight:
        data.freight !== undefined ? Number(data.freight) : 0,

      // ✅ UPDATED FIELDS
      cooly: data.cooly !== undefined ? Number(data.cooly) : 0,
      bale: data.bale !== undefined ? Number(data.bale) : 0,

      // ✅ TAX RATES ONLY
      sgst: data.sgst !== undefined ? Number(data.sgst) : 0,
      cgst: data.cgst !== undefined ? Number(data.cgst) : 0,
      igst: data.igst !== undefined ? Number(data.igst) : 0,

      grossWeight:
        data.grossWeight !== undefined ? Number(data.grossWeight) : null,
      tareWeight:
        data.tareWeight !== undefined ? Number(data.tareWeight) : null,
      nettWeight:
        data.nettWeight !== undefined ? Number(data.nettWeight) : null,

      permitNo: data.permitNo || null,
      comm: data.comm !== undefined ? Number(data.comm) : null,

      remarks: data.remarks || null,
    };

    const response = await api.post("/", payload);
    return response.data.inwardEntry;
  },

  /* =============================
     UPDATE INWARD ENTRY
  ============================= */
  update: async (id, data) => {
    const payload = {
      inwardNo: data.inwardNo,
      inwardDate: data.inwardDate,

      purchaseOrderId:
        data.purchaseOrderId !== undefined
          ? Number(data.purchaseOrderId)
          : undefined,

      godownId:
        data.godownId !== undefined ? Number(data.godownId) : undefined,

      orderNo: data.orderNo,
      lcNo: data.lcNo,
      paymentDays:
        data.paymentDays !== undefined ? Number(data.paymentDays) : undefined,
      paymentDate: data.paymentDate,
      govtForm: data.govtForm,
      type: data.type,

      billNo: data.billNo,
      billDate: data.billDate,
      lotNo: data.lotNo,
      lorryNo: data.lorryNo,

      candyRate:
        data.candyRate !== undefined ? Number(data.candyRate) : undefined,
      pMark: data.pMark,
      pressRunningNo: data.pressRunningNo,
      commisType: data.commisType,
      commisValue:
        data.commisValue !== undefined ? Number(data.commisValue) : undefined,

      balesQty:
        data.balesQty !== undefined ? Number(data.balesQty) : undefined,

      freight:
        data.freight !== undefined ? Number(data.freight) : undefined,

      // ✅ UPDATED
      cooly: data.cooly !== undefined ? Number(data.cooly) : undefined,
      bale: data.bale !== undefined ? Number(data.bale) : undefined,

      // ✅ TAX RATES ONLY
      sgst: data.sgst !== undefined ? Number(data.sgst) : undefined,
      cgst: data.cgst !== undefined ? Number(data.cgst) : undefined,
      igst: data.igst !== undefined ? Number(data.igst) : undefined,

      grossWeight:
        data.grossWeight !== undefined ? Number(data.grossWeight) : undefined,
      tareWeight:
        data.tareWeight !== undefined ? Number(data.tareWeight) : undefined,
      nettWeight:
        data.nettWeight !== undefined ? Number(data.nettWeight) : undefined,

      permitNo: data.permitNo,
      comm: data.comm !== undefined ? Number(data.comm) : undefined,

      remarks: data.remarks,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.inwardEntry;
  },

  /* =============================
     DELETE
  ============================= */
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default inwardEntryService;
