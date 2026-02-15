import express from "express";
import {
  createWasteInvoiceType,
  getAllWasteInvoiceTypes,
  getWasteInvoiceTypeById,
  updateWasteInvoiceType,
  deleteWasteInvoiceType,
  // getNextWasteInvoiceCodeController, // optional
} from "../controllers/wasteInvoiceTypeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes (authentication required)
router.use(protect);

// Optional next code route
// router.get("/next-code", getNextWasteInvoiceCodeController);

router.post("/", createWasteInvoiceType);
router.get("/", getAllWasteInvoiceTypes);
router.get("/:id", getWasteInvoiceTypeById);
router.put("/:id", updateWasteInvoiceType);
router.delete("/:id", deleteWasteInvoiceType);

export default router;