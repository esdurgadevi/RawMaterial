import express from "express";
import {
  createVariety,
  getAllVarieties,
  getVarietyById,
  updateVariety,
  deleteVariety,
} from "../controllers/varietyController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", createVariety);
router.get("/", getAllVarieties);
router.get("/:id", getVarietyById);
router.put("/:id", updateVariety);
router.delete("/:id", deleteVariety);

export default router;






