import * as issueService from "../services/issueEntryService.js";
import { getNextIssueNumber } from "../utils/helpers.js";

export const createIssue = async (req, res) => {
  try {
    const issue = await issueService.create(req.body);
    res.status(201).json({ issue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const issues = await issueService.getAll();
    res.status(200).json({ issues });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await issueService.getById(req.params.id);
    res.status(200).json({ issue });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const issue = await issueService.update(req.params.id, req.body);
    res.status(200).json({ issue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    await issueService.remove(req.params.id);
    res.status(200).json({ message: "Issue deleted" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getNextIssueNo = async (req, res) => {
  try {
    const nextIssueNo = await getNextIssueNumber();
    res.status(200).json({
      message: "Next issue number generated",
      nextIssueNo,
    });
  } catch (error) {
    console.error("Error generating next issue no:", error);
    res.status(500).json({ message: "Failed to generate next issue number" });
  }
};

export const getIssuesByLotNo = async (req, res) => {
  try {
    const { lotNo } = req.params;

    const issues = await issueService.getByLotNo(lotNo);

    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

