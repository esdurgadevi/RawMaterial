import express from "express";
import {
  createWasteInvoiceType,
  getAllWasteInvoiceTypes,
  getWasteInvoiceTypeById,
  updateWasteInvoiceType,
  deleteWasteInvoiceType,
} from "../controllers/wasteInvoiceTypeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes (authentication required)
router.use(protect);

router.post("/", createWasteInvoiceType);
router.get("/", getAllWasteInvoiceTypes);
router.get("/:id", getWasteInvoiceTypeById);
router.put("/:id", updateWasteInvoiceType);
router.delete("/:id", deleteWasteInvoiceType);

export default router;