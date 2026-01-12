import express from "express";
import {
  getNextLotNo,
  createLotEntry,
  getAllLotEntries,
  getLotEntryById,
  updateLotEntry,
  deleteLotEntry,
} from "../controllers/lotEntryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/next-lot-no", getNextLotNo);
router.post("/", createLotEntry);
router.get("/", getAllLotEntries);
router.get("/:id", getLotEntryById);
router.put("/:id", updateLotEntry);
router.delete("/:id", deleteLotEntry);

export default router;