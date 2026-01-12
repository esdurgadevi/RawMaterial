import axios from "axios";

// ✅ Backend base URL (change if your port is different)
const API_URL = "http://localhost:5000/api/inward-entries";

// ✅ Axios instance
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

// ✅ Service object with all methods
const inwardEntryService = {
  // 1. Get the NEXT auto-generated Inward No (e.g., GI/25-26/0087)
  getNextInwardNo: async () => {
    try {
      const response = await api.get("/next-inward-no");
      return response.data.nextInwardNo; // e.g., "GI/25-26/0087"
    } catch (error) {
      console.error("Error fetching next inward number:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch next inward number"
      );
    }
  },

  // 2. Get all inward entries
  getAll: async () => {
    try {
      const response = await api.get("/");
      return response.data.inwardEntries; // array of entries
    } catch (error) {
      console.error("Error fetching inward entries:", error);
      throw new Error("Failed to fetch inward entries");
    }
  },

  // 3. Get single inward entry by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data.inwardEntry;
    } catch (error) {
      console.error("Error fetching inward entry:", error);
      throw new Error("Failed to fetch inward entry");
    }
  },

  // 4. Create new inward entry
  create: async (data) => {
    try {
      const payload = {
        inwardNo: data.inwardNo, // Frontend should send from getNextInwardNo()
        orderNo: data.orderNo || null,
        lcNo: data.lcNo || null,
        paymentDays: data.paymentDays !== undefined ? Number(data.paymentDays) : null,
        paymentDate: data.paymentDate || null,
        govtForm: data.govtForm || null,
        type: data.type || null,
        inwardDate: data.inwardDate, // YYYY-MM-DD (required)

        billNo: data.billNo || null,
        billDate: data.billDate || null,
        lotNo: data.lotNo || null,
        lorryNo: data.lorryNo || null,
        date: data.date || null,

        candyRate: data.candyRate !== undefined ? Number(data.candyRate) : null,
        pMark: data.pMark || null,
        pressRunningNo: data.pressRunningNo || null,
        commisType: data.commisType || null,
        commisValue: data.commisValue !== undefined ? Number(data.commisValue) : null,

        godownId: data.godownId !== undefined ? Number(data.godownId) : null,

        balesQty: data.balesQty !== undefined ? Number(data.balesQty) : null,
        freight: data.freight !== undefined ? Number(data.freight) : null,
        coolyBale: data.coolyBale !== undefined ? Number(data.coolyBale) : null,

        gst: data.gst !== undefined ? Number(data.gst) : null,
        sgst: data.sgst !== undefined ? Number(data.sgst) : null,
        cgst: data.cgst !== undefined ? Number(data.cgst) : null,
        igst: data.igst !== undefined ? Number(data.igst) : null,
        tax: data.tax !== undefined ? Number(data.tax) : null,
        taxAmount: data.taxAmount !== undefined ? Number(data.taxAmount) : null,

        grossWeight: data.grossWeight !== undefined ? Number(data.grossWeight) : null,
        tareWeight: data.tareWeight !== undefined ? Number(data.tareWeight) : null,
        nettWeight: data.nettWeight !== undefined ? Number(data.nettWeight) : null,

        permitNo: data.permitNo || null,
        comm: data.comm !== undefined ? Number(data.comm) : null,

        remarks: data.remarks || null,
      };

      const response = await api.post("/", payload);
      return response.data.inwardEntry;
    } catch (error) {
      console.error("Error creating inward entry:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create inward entry"
      );
    }
  },

  // 5. Update existing inward entry
  update: async (id, data) => {
    try {
      const payload = {
        inwardNo: data.inwardNo,
        orderNo: data.orderNo !== undefined ? data.orderNo : undefined,
        lcNo: data.lcNo !== undefined ? data.lcNo : undefined,
        paymentDays:
          data.paymentDays !== undefined ? Number(data.paymentDays) : undefined,
        paymentDate: data.paymentDate !== undefined ? data.paymentDate : undefined,
        govtForm: data.govtForm !== undefined ? data.govtForm : undefined,
        type: data.type !== undefined ? data.type : undefined,
        inwardDate: data.inwardDate !== undefined ? data.inwardDate : undefined,
        billNo: data.billNo !== undefined ? data.billNo : undefined,
        billDate: data.billDate !== undefined ? data.billDate : undefined,
        lotNo: data.lotNo !== undefined ? data.lotNo : undefined,
        lorryNo: data.lorryNo !== undefined ? data.lorryNo : undefined,
        date: data.date !== undefined ? data.date : undefined,

        candyRate: data.candyRate !== undefined ? Number(data.candyRate) : undefined,
        pMark: data.pMark !== undefined ? data.pMark : undefined,
        pressRunningNo:
          data.pressRunningNo !== undefined ? data.pressRunningNo : undefined,
        commisType: data.commisType !== undefined ? data.commisType : undefined,
        commisValue:
          data.commisValue !== undefined ? Number(data.commisValue) : undefined,

        godownId:
          data.godownId !== undefined ? Number(data.godownId) : undefined,

        balesQty:
          data.balesQty !== undefined ? Number(data.balesQty) : undefined,
        freight: data.freight !== undefined ? Number(data.freight) : undefined,
        coolyBale:
          data.coolyBale !== undefined ? Number(data.coolyBale) : undefined,

        gst: data.gst !== undefined ? Number(data.gst) : undefined,
        sgst: data.sgst !== undefined ? Number(data.sgst) : undefined,
        cgst: data.cgst !== undefined ? Number(data.cgst) : undefined,
        igst: data.igst !== undefined ? Number(data.igst) : undefined,
        tax: data.tax !== undefined ? Number(data.tax) : undefined,
        taxAmount:
          data.taxAmount !== undefined ? Number(data.taxAmount) : undefined,

        grossWeight:
          data.grossWeight !== undefined ? Number(data.grossWeight) : undefined,
        tareWeight:
          data.tareWeight !== undefined ? Number(data.tareWeight) : undefined,
        nettWeight:
          data.nettWeight !== undefined ? Number(data.nettWeight) : undefined,

        permitNo: data.permitNo !== undefined ? data.permitNo : undefined,
        comm: data.comm !== undefined ? Number(data.comm) : undefined,

        remarks: data.remarks !== undefined ? data.remarks : undefined,
      };

      const response = await api.put(`/${id}`, payload);
      return response.data.inwardEntry;
    } catch (error) {
      console.error("Error updating inward entry:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update inward entry"
      );
    }
  },

  // 6. Delete inward entry
  delete: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data; // { message: "Inward entry deleted successfully" }
    } catch (error) {
      console.error("Error deleting inward entry:", error);
      throw new Error("Failed to delete inward entry");
    }
  },
};

export default inwardEntryService;