import * as wasteEntryService from "../services/wasteEntryService.js";

export const createWasteEntry = async (req, res) => {
  try {
    const entry = await wasteEntryService.create(req.body);
    res.status(201).json({
      message: "Waste entry created successfully",
      entry,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWasteEntries = async (req, res) => {
  try {
    const entries = await wasteEntryService.getAll(req.query);
    res.status(200).json({
      message: "Waste entries retrieved successfully",
      entries,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWasteEntryById = async (req, res) => {
  try {
    const entry = await wasteEntryService.getById(req.params.id);
    res.status(200).json({
      message: "Waste entry retrieved successfully",
      entry,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWasteEntry = async (req, res) => {
  try {
    const entry = await wasteEntryService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Waste entry updated successfully",
      entry,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWasteEntry = async (req, res) => {
  try {
    await wasteEntryService.remove(req.params.id);
    res.status(200).json({
      message: "Waste entry deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};