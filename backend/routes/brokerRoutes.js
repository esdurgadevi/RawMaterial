import express from "express";
import {
  createBroker,
  getAllBrokers,
  getBrokerById,
  updateBroker,
  deleteBroker,
} from "../controllers/brokerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.post("/", createBroker);
router.get("/", getAllBrokers);
router.get("/:id", getBrokerById);
router.put("/:id", updateBroker);
router.delete("/:id", deleteBroker);

export default router;