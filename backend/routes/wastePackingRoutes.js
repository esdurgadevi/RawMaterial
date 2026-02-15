import express from "express";
import {
  createWastePacking,
  getAllWastePackings,
  getWastePackingById,
  updateWastePacking,
  deleteWastePacking,
} from "../controllers/admin1/transaction-waste/wastePackingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.post("/", createWastePacking);
router.get("/", getAllWastePackings);
router.get("/:id", getWastePackingById);
router.put("/:id", updateWastePacking);
router.delete("/:id", deleteWastePacking);

export default router;