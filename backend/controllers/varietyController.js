import * as varietyService from "../services/varietyService.js";

export const createVariety = async (req, res) => {
  try {
    const variety = await varietyService.createVariety(req.body);
    res.status(201).json({
      message: "Variety created successfully",
      variety,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllVarieties = async (req, res) => {
  try {
    const varieties = await varietyService.getAllVarieties();
    res.status(200).json({
      message: "Varieties retrieved successfully",
      varieties,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getVarietyById = async (req, res) => {
  try {
    const variety = await varietyService.getVarietyById(req.params.id);
    res.status(200).json({
      message: "Variety retrieved successfully",
      variety,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateVariety = async (req, res) => {
  try {
    const variety = await varietyService.updateVariety(req.params.id, req.body);
    res.status(200).json({
      message: "Variety updated successfully",
      variety,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVariety = async (req, res) => {
  try {
    await varietyService.deleteVariety(req.params.id);
    res.status(200).json({
      message: "Variety deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};