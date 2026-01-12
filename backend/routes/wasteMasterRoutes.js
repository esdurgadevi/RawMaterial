import express from "express";
import {
  createWasteMaster,
  getAllWasteMasters,
  getWasteMasterById,
  updateWasteMaster,
  deleteWasteMaster,
} from "../controllers/wasteMasterController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", createWasteMaster);
router.get("/", getAllWasteMasters);
router.get("/:id", getWasteMasterById);
router.put("/:id", updateWasteMaster);
router.delete("/:id", deleteWasteMaster);

export default router;