import express from "express";
import {
  createTransport,
  getAllTransports,
  getTransportById,
  updateTransport,
  deleteTransport,
} from "../controllers/transportController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.post("/", createTransport);
router.get("/", getAllTransports);
router.get("/:id", getTransportById);
router.put("/:id", updateTransport);
router.delete("/:id", deleteTransport);

export default router;