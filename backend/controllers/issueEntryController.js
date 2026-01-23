// controllers/issueEntryController.js
import * as service from "../services/issueEntryService.js";
import { getNextIssueNo } from "../utils/helpers.js";

export const getNextIssueNumber = async (req, res) => {
  try {
    const nextNo = await getNextIssueNo();
    res.json({ nextIssueNo: nextNo });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createIssue = async (req, res) => {
  try {
    const entry = await service.createIssueEntry(req.body);
    res.status(201).json({ message: "Issue entry created", entry });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const entries = await service.getAllIssues();
    res.json(entries);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getIssue = async (req, res) => {
  try {
    const entry = await service.getIssueById(req.params.id);
    res.json(entry);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const entry = await service.updateIssueEntry(req.params.id, req.body);
    res.json({ message: "Issue entry updated", entry });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    await service.deleteIssueEntry(req.params.id);
    res.json({ message: "Issue entry deleted" });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};
