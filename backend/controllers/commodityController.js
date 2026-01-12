import * as commodityService from "../services/commodityService.js";

export const createCommodity = async (req, res) => {
  try {
    const commodity = await commodityService.createCommodity(req.body);
    res.status(201).json({
      message: "Commodity created successfully",
      commodity,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllCommodities = async (req, res) => {
  try {
    const commodities = await commodityService.getAllCommodities();
    res.status(200).json({
      message: "Commodities retrieved successfully",
      commodities,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCommodityById = async (req, res) => {
  try {
    const commodity = await commodityService.getCommodityById(req.params.id);
    res.status(200).json({
      message: "Commodity retrieved successfully",
      commodity,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateCommodity = async (req, res) => {
  try {
    const commodity = await commodityService.updateCommodity(req.params.id, req.body);
    res.status(200).json({
      message: "Commodity updated successfully",
      commodity,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCommodity = async (req, res) => {
  try {
    await commodityService.deleteCommodity(req.params.id);
    res.status(200).json({
      message: "Commodity deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};