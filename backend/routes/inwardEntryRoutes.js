import express from "express";
import {
  getNextInwardNo,
  createInwardEntry,
  getAllInwardEntries,
  getInwardEntryById,
  updateInwardEntry,
  deleteInwardEntry,
} from "../controllers/inwardEntryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/next-inward-no", getNextInwardNo);
router.post("/", createInwardEntry);
router.get("/", getAllInwardEntries);
router.get("/:id", getInwardEntryById);
router.put("/:id", updateInwardEntry);
router.delete("/:id", deleteInwardEntry);

export default router;