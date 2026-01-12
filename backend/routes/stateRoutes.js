import express from "express";
import {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
} from "../controllers/stateController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // Protected routes (can be made admin-only later)

router.post("/", createState);
router.get("/", getAllStates);
router.get("/:id", getStateById);
router.put("/:id", updateState);
router.delete("/:id", deleteState);

export default router;