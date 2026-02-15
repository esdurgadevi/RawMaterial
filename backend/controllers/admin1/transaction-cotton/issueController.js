import * as issueService from "../../../services/admin1/transaction-cotton/issueService.js";
import { getNextIssueNumber } from "../../../utils/helpers.js";

export const createIssue = async (req, res) => {
  try {
    const issue = await issueService.create(req.body);
    res.status(201).json({
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const issues = await issueService.getAll();
    res.status(200).json({
      message: "Issues retrieved successfully",
      issues,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await issueService.getById(req.params.id);
    res.status(200).json({
      message: "Issue retrieved successfully",
      issue,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    await issueService.remove(req.params.id);
    res.status(200).json({
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getNextIssueNo = async (req, res) => {
  try {
    const nextIssueNo = await getNextIssueNumber();
    res.status(200).json({
      message: "Next order number generated",
      nextIssueNo,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate next order number" });
  }
};