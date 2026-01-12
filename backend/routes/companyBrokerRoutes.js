import express from "express";
import {
  createCompanyBroker,
  getAllCompanyBrokers,
  getCompanyBrokerById,
  updateCompanyBroker,
  deleteCompanyBroker,
} from "../controllers/companyBrokerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", createCompanyBroker);
router.get("/", getAllCompanyBrokers);
router.get("/:id", getCompanyBrokerById);
router.put("/:id", updateCompanyBroker);
router.delete("/:id", deleteCompanyBroker);

export default router;