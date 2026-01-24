import express from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getNextIssueNo,
  getIssuesByLotNo
} from "../controllers/issueEntryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/next-issue-no", getNextIssueNo);
router.post("/", createIssue);
router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);
router.get("/by-lot/:lotNo", getIssuesByLotNo);

export default router;
