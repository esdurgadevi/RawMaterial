import * as lotEntryService from "../services/lotEntryService.js";

export const getNextLotNo = async (req, res) => {
  try {
    const nextNo = await lotEntryService.getNextLotNo();
    res.status(200).json({
      message: "Next lot number generated",
      nextLotNo: nextNo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLotEntry = async (req, res) => {
  try {
    const entry = await lotEntryService.createLotEntry(req.body);
    res.status(201).json({
      message: "Lot entry created successfully",
      lotEntry: entry,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllLotEntries = async (req, res) => {
  try {
    const entries = await lotEntryService.getAllLotEntries();
    res.status(200).json({
      message: "Lot entries retrieved successfully",
      lotEntries: entries,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLotEntryById = async (req, res) => {
  try {
    const entry = await lotEntryService.getLotEntryById(req.params.id);
    res.status(200).json({
      message: "Lot entry retrieved successfully",
      lotEntry: entry,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateLotEntry = async (req, res) => {
  try {
    const entry = await lotEntryService.updateLotEntry(req.params.id, req.body);
    res.status(200).json({
      message: "Lot entry updated successfully",
      lotEntry: entry,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLotEntry = async (req, res) => {
  try {
    await lotEntryService.deleteLotEntry(req.params.id);
    res.status(200).json({
      message: "Lot entry deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};