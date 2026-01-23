// routes/issueEntryRoutes.js
import express from "express";
import {
  getNextIssueNumber,
  createIssue,
  getAllIssues,
  getIssue,
  updateIssue,
  deleteIssue,
} from "../controllers/issueEntryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/next-issue-no", getNextIssueNumber);
router.post("/", createIssue);
router.get("/", getAllIssues);
router.get("/:id", getIssue);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);

export default router;
