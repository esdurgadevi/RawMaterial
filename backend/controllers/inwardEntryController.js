import * as inwardEntryService from "../services/inwardEntryService.js";

export const getNextInwardNo = async (req, res) => {
  try {
    const nextNo = await inwardEntryService.getNextInwardNo();
    res.status(200).json({
      message: "Next inward number generated",
      nextInwardNo: nextNo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInwardEntry = async (req, res) => {
  try {
    const entry = await inwardEntryService.createInwardEntry(req.body);
    res.status(201).json({
      message: "Inward entry created successfully",
      inwardEntry: entry,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllInwardEntries = async (req, res) => {
  try {
    const entries = await inwardEntryService.getAllInwardEntries();
    res.status(200).json({
      message: "Inward entries retrieved successfully",
      inwardEntries: entries,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInwardEntryById = async (req, res) => {
  try {
    const entry = await inwardEntryService.getInwardEntryById(req.params.id);
    res.status(200).json({
      message: "Inward entry retrieved successfully",
      inwardEntry: entry,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateInwardEntry = async (req, res) => {
  try {
    const entry = await inwardEntryService.updateInwardEntry(req.params.id, req.body);
    res.status(200).json({
      message: "Inward entry updated successfully",
      inwardEntry: entry,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInwardEntry = async (req, res) => {
  try {
    await inwardEntryService.deleteInwardEntry(req.params.id);
    res.status(200).json({
      message: "Inward entry deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};