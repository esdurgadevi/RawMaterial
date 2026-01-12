import * as brokerService from "../services/brokerService.js";

export const createBroker = async (req, res) => {
  try {
    const broker = await brokerService.createBroker(req.body);
    res.status(201).json({
      message: "Broker created successfully",
      broker,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllBrokers = async (req, res) => {
  try {
    const brokers = await brokerService.getAllBrokers();
    res.status(200).json({
      message: "Brokers retrieved successfully",
      brokers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBrokerById = async (req, res) => {
  try {
    const broker = await brokerService.getBrokerById(req.params.id);
    res.status(200).json({
      message: "Broker retrieved successfully",
      broker,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateBroker = async (req, res) => {
  try {
    const broker = await brokerService.updateBroker(req.params.id, req.body);
    res.status(200).json({
      message: "Broker updated successfully",
      broker,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBroker = async (req, res) => {
  try {
    await brokerService.deleteBroker(req.params.id);
    res.status(200).json({
      message: "Broker deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};