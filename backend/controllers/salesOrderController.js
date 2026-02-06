// controllers/salesOrderController.js
import * as salesOrderService from "../services/salesOrderService.js";

export const createSalesOrder = async (req, res) => {
  try {
    const order = await salesOrderService.create(req.body);
    res.status(201).json({
      message: "Sales order created successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllSalesOrders = async (req, res) => {
  try {
    const orders = await salesOrderService.getAll();
    res.status(200).json({
      message: "Sales orders retrieved successfully",
      orders,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSalesOrderById = async (req, res) => {
  try {
    const order = await salesOrderService.getById(req.params.id);
    res.status(200).json({
      message: "Sales order retrieved successfully",
      order,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSalesOrder = async (req, res) => {
  try {
    const order = await salesOrderService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Sales order updated successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSalesOrder = async (req, res) => {
  try {
    await salesOrderService.remove(req.params.id);
    res.status(200).json({
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};