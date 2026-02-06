import * as wastePackingService from "../services/wastePackingService.js";

export const createWastePacking = async (req, res) => {
  try {
    const packing = await wastePackingService.create(req.body);
    res.status(201).json({
      message: "Waste packing created successfully",
      packing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWastePackings = async (req, res) => {
  try {
    const packings = await wastePackingService.getAll();
    res.status(200).json({
      message: "Waste packings retrieved successfully",
      packings,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWastePackingById = async (req, res) => {
  try {
    const packing = await wastePackingService.getById(req.params.id);
    res.status(200).json({
      message: "Waste packing retrieved successfully",
      packing,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWastePacking = async (req, res) => {
  try {
    const packing = await wastePackingService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Waste packing updated successfully",
      packing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWastePacking = async (req, res) => {
  try {
    await wastePackingService.remove(req.params.id);
    res.status(200).json({
      message: "Waste packing deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};