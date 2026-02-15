import express from "express";
import {
  createWasteLot,
  getAllWasteLots,
  getWasteLotById,
  updateWasteLot,
  deleteWasteLot,
} from "../controllers/admin1/master/wasteLotController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createWasteLot);
router.get("/", getAllWasteLots);
router.get("/:id", getWasteLotById);
router.put("/:id", updateWasteLot);
router.delete("/:id", deleteWasteLot);

export default router;