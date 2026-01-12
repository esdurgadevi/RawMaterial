import express from "express";
import {
  createMixing,
  getAllMixings,
  getMixingById,
  updateMixing,
  deleteMixing,
} from "../controllers/mixingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", createMixing);
router.get("/", getAllMixings);
router.get("/:id", getMixingById);
router.put("/:id", updateMixing);
router.delete("/:id", deleteMixing);

export default router;