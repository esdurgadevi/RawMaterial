import axios from "axios";

// Backend base URL (change port if needed)
const API_URL = "http://localhost:5000/api/lot-entries";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token from localStorage
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

// Service object
const inwardLotService = {
  // 1. Get the NEXT auto-generated Lot No (UC/25-26/XXXX)
  getNextLotNo: async () => {
    try {
      const response = await api.get("/next-lot-no");
      return response.data.nextLotNo; // e.g., "UC/25-26/0270"
    } catch (error) {
      console.error("Error fetching next lot number:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch next lot number"
      );
    }
  },

  // 2. Get all lot entries
  getAll: async () => {
    try {
      const response = await api.get("/");
      return response.data.lotEntries; // array of lot entries
    } catch (error) {
      console.error("Error fetching lot entries:", error);
      throw new Error("Failed to fetch lot entries");
    }
  },

  // 3. Get single lot entry by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data.lotEntry;
    } catch (error) {
      console.error("Error fetching lot entry:", error);
      throw new Error("Failed to fetch lot entry");
    }
  },

  // 4. Create new lot entry
  create: async (data) => {
    try {
      const payload = {
        lotNo: data.lotNo, // Should come from getNextLotNo()
        inwardId: Number(data.inwardId), // Required FK to inward_entries.id

        partyDate: data.partyDate || null,
        billNo: data.billNo || null,
        freight: data.freight !== undefined ? Number(data.freight) : null,
        billDate: data.billDate || null,
        coolyBale: data.coolyBale !== undefined ? Number(data.coolyBale) : null,
        lorryNo: data.lorryNo || null,
        taxPercentage: data.taxPercentage !== undefined ? Number(data.taxPercentage) : null,
        taxAmount: data.taxAmount !== undefined ? Number(data.taxAmount) : null,
        date: data.date || null,
        grossWeight: data.grossWeight !== undefined ? Number(data.grossWeight) : null,
        candyRate: data.candyRate !== undefined ? Number(data.candyRate) : null,
        tareWeight: data.tareWeight !== undefined ? Number(data.tareWeight) : null,
        pMark: data.pMark || null,
        nettWeight: data.nettWeight !== undefined ? Number(data.nettWeight) : null,
        pressRunningNo: data.pressRunningNo || null,
        permitNo: data.permitNo || null,
        commisType: data.commisType || null,
        commisValue: data.commisValue !== undefined ? Number(data.commisValue) : null,
      };

      const response = await api.post("/", payload);
      return response.data.lotEntry;
    } catch (error) {
      console.error("Error creating lot entry:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create lot entry"
      );
    }
  },

  // 5. Update existing lot entry
  update: async (id, data) => {
    try {
      const payload = {
        lotNo: data.lotNo,
        inwardId: data.inwardId !== undefined ? Number(data.inwardId) : undefined,

        partyDate: data.partyDate !== undefined ? data.partyDate : undefined,
        billNo: data.billNo !== undefined ? data.billNo : undefined,
        freight: data.freight !== undefined ? Number(data.freight) : undefined,
        billDate: data.billDate !== undefined ? data.billDate : undefined,
        coolyBale: data.coolyBale !== undefined ? Number(data.coolyBale) : undefined,
        lorryNo: data.lorryNo !== undefined ? data.lorryNo : undefined,
        taxPercentage:
          data.taxPercentage !== undefined ? Number(data.taxPercentage) : undefined,
        taxAmount: data.taxAmount !== undefined ? Number(data.taxAmount) : undefined,
        date: data.date !== undefined ? data.date : undefined,
        grossWeight:
          data.grossWeight !== undefined ? Number(data.grossWeight) : undefined,
        candyRate: data.candyRate !== undefined ? Number(data.candyRate) : undefined,
        tareWeight: data.tareWeight !== undefined ? Number(data.tareWeight) : undefined,
        pMark: data.pMark !== undefined ? data.pMark : undefined,
        nettWeight: data.nettWeight !== undefined ? Number(data.nettWeight) : undefined,
        pressRunningNo:
          data.pressRunningNo !== undefined ? data.pressRunningNo : undefined,
        permitNo: data.permitNo !== undefined ? data.permitNo : undefined,
        commisType: data.commisType !== undefined ? data.commisType : undefined,
        commisValue:
          data.commisValue !== undefined ? Number(data.commisValue) : undefined,
      };

      const response = await api.put(`/${id}`, payload);
      return response.data.lotEntry;
    } catch (error) {
      console.error("Error updating lot entry:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update lot entry"
      );
    }
  },

  // 6. Delete lot entry
  delete: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data; // { message: "Lot entry deleted successfully" }
    } catch (error) {
      console.error("Error deleting lot entry:", error);
      throw new Error("Failed to delete lot entry");
    }
  },
};

export default inwardLotService;