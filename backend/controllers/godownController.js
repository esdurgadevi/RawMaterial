import * as godownService from "../services/godownService.js";

export const createGodown = async (req, res) => {
  try {
    const godown = await godownService.createGodown(req.body);
    res.status(201).json({
      message: "Godown created successfully",
      godown,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllGodowns = async (req, res) => {
  try {
    const godowns = await godownService.getAllGodowns();
    res.status(200).json({
      message: "Godowns retrieved successfully",
      godowns,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getGodownById = async (req, res) => {
  try {
    const godown = await godownService.getGodownById(req.params.id);
    res.status(200).json({
      message: "Godown retrieved successfully",
      godown,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateGodown = async (req, res) => {
  try {
    const godown = await godownService.updateGodown(req.params.id, req.body);
    res.status(200).json({
      message: "Godown updated successfully",
      godown,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGodown = async (req, res) => {
  try {
    await godownService.deleteGodown(req.params.id);
    res.status(200).json({
      message: "Godown deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};