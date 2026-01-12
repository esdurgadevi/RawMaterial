import * as stateService from "../services/stateService.js";

export const createState = async (req, res) => {
  try {
    const state = await stateService.createState(req.body);
    res.status(201).json({
      message: "State created successfully",
      state,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllStates = async (req, res) => {
  try {
    const states = await stateService.getAllStates();
    res.status(200).json({
      message: "States retrieved successfully",
      states,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getStateById = async (req, res) => {
  try {
    const state = await stateService.getStateById(req.params.id);
    res.status(200).json({
      message: "State retrieved successfully",
      state,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateState = async (req, res) => {
  try {
    const state = await stateService.updateState(req.params.id, req.body);
    res.status(200).json({
      message: "State updated successfully",
      state,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteState = async (req, res) => {
  try {
    await stateService.deleteState(req.params.id);
    res.status(200).json({
      message: "State deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};