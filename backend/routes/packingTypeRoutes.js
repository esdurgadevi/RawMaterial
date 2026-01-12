import express from "express";
import {
  createPackingType,
  getAllPackingTypes,
  getPackingTypeById,
  updatePackingType,
  deletePackingType,
} from "../controllers/packingTypeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes (authentication required)
router.use(protect);

router.post("/", createPackingType);
router.get("/", getAllPackingTypes);
router.get("/:id", getPackingTypeById);
router.put("/:id", updatePackingType);
router.delete("/:id", deletePackingType);

export default router;