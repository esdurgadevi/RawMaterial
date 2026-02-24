// services/inwardLotService.js
import axios from "axios";

// ---------------- LOT API ----------------
const LOT_API_URL = "http://localhost:5000/api/inward-lots";

// ---------------- WEIGHTMENT API ----------------
const WEIGHTMENT_API_URL = "http://localhost:5000/api/weightments";

// Axios instances
const lotApi = axios.create({
  baseURL: LOT_API_URL,
  headers: { "Content-Type": "application/json" },
});

const weightmentApi = axios.create({
  baseURL: WEIGHTMENT_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

lotApi.interceptors.request.use(attachToken);
weightmentApi.interceptors.request.use(attachToken);

const inwardLotService = {
  /* =============================
     CREATE LOT + WEIGHTMENTS SAFELY
     - Rollback if weightment creation fails
  ============================= */
  createLotWithWeightments: async (lotData, weightments = []) => {
  const lotPayload = {
    inwardId: lotData.inwardId,
    lotNo: lotData.lotNo,
    setNo: String(lotData.setNo) || null,
    balesQty: Number(lotData.balesQty) || 0,
    grossWeight: Number(lotData.grossWeight) || 0,
    tareWeight: Number(lotData.tareWeight) || 0,
    nettWeight: Number(lotData.nettWeight) || 0,
    candyRate: Number(lotData.candyRate) || 0,
    quintalRate: Number(lotData.quintalRate) || 0,
    ratePerKg: Number(lotData.ratePerKg) || 0,
    invoiceValue: Number(lotData.invoiceValue) || 0,
    cessPaidAmount: 200,
  };

  let createdLot = null;

  try {
    // 1️⃣ Create Lot
    const lotResponse = await lotApi.post("/", lotPayload);
    createdLot = lotResponse.data.lot;

    // 2️⃣ Create Weightments
    if (weightments.length > 0) {
      // Only send required fields
      const payload = weightments.map(w => ({
        grossWeight: w.grossWeight,
        tareWeight: w.tareWeight,
        baleValue: w.baleValue,
      }));
      const lotNo = encodeURIComponent(createdLot.lotNo);
      await weightmentApi.post(
        `/${lotNo}/weightments`,
        payload
      );
    }

    return createdLot;
  } catch (error) {
    // 🔥 Rollback lot if weightment creation fails
    if (createdLot && createdLot.lotNo) {
      try {
        //await lotApi.delete(`/${createdLot.lotNo}`);
        console.error(
          `Weightment creation failed. Rolled back lot ${createdLot.lotNo}`
        );
      } catch (rollbackError) {
        console.error(
          `Failed to rollback lot ${createdLot.lotNo}:`,
          rollbackError
        );
      }
    }

    throw error;
  }
},


  /* =============================
     GET NEXT LOT NO
  ============================= */
  getNextLotNo: async () => {
    const res = await lotApi.get("/next-lot-no");
    return res.data.lotNo;
  },
  getAllLotNumbers: async()=>{
    const res = await lotApi.get("/");
    return res.data;
  },

  /* =============================
     GET LOT BY LOT NO
  ============================= */
  getByLotNo: async (lotNo) => {
    const res = await lotApi.get(`/${lotNo}`);
    return res.data;
  },

  /* =============================
     GET WEIGHTMENTS BY LOT NO
  ============================= */
  getWeightments: async (lotNo) => {
    const lotNo1 = encodeURIComponent(lotNo);
    const res = await weightmentApi.get(`/${lotNo1}/weightments`); 
    console.log(res);
    return res.data;
  },

  /* =============================
     UPDATE LOT
  ============================= */
  updateLot: async (lotNo, data) => {
    const res = await lotApi.put(`/${lotNo}`, data);
    return res.data.lot;
  },

  /* =============================
     UPDATE WEIGHTMENTS BY LOT NO
  ============================= */
  updateWeightments: async (lotNo, data) => {
    const res = await weightmentApi.put(`/${lotNo}/weightments`, data);
    return res.data.weightments;
  },

  /* =============================
     DELETE LOT
  ============================= */
  deleteLot: async (lotNo) => {
    const res = await lotApi.delete(`/${lotNo}`);
    return res.data;
  },

  /* =============================
     DELETE WEIGHTMENTS BY LOT NO
  ============================= */
  deleteWeightments: async (lotNo) => {
    const res = await weightmentApi.delete(`/${lotNo}/weightments`);
    return res.data;
  },
};

export default inwardLotService;
