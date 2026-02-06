// controllers/invoiceController.js
import * as invoiceService from "../services/invoiceService.js";

export const createInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.create(req.body);
    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.getAll();
    res.status(200).json({
      message: "Invoices retrieved successfully",
      invoices,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await invoiceService.getById(req.params.id);
    res.status(200).json({
      message: "Invoice retrieved successfully",
      invoice,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    await invoiceService.remove(req.params.id);
    res.status(200).json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};