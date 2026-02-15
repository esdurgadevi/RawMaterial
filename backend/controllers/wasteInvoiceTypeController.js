import * as wasteInvoiceTypeService from "../services/admin1/master/wasteInvoiceTypeService.js";
// Optional: import next code helper if you have one
// import { getNextWasteInvoiceCode } from "../utils/helpers.js";

export const createWasteInvoiceType = async (req, res) => {
  try {
    const type = await wasteInvoiceTypeService.createWasteInvoiceType(req.body);
    res.status(201).json({
      message: "Waste invoice type created successfully",
      wasteInvoiceType: type,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWasteInvoiceTypes = async (req, res) => {
  try {
    const types = await wasteInvoiceTypeService.getAllWasteInvoiceTypes();
    res.status(200).json({
      message: "Waste invoice types retrieved successfully",
      wasteInvoiceTypes: types,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWasteInvoiceTypeById = async (req, res) => {
  try {
    const type = await wasteInvoiceTypeService.getWasteInvoiceTypeById(req.params.id);
    res.status(200).json({
      message: "Waste invoice type retrieved successfully",
      wasteInvoiceType: type,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWasteInvoiceType = async (req, res) => {
  try {
    const type = await wasteInvoiceTypeService.updateWasteInvoiceType(req.params.id, req.body);
    res.status(200).json({
      message: "Waste invoice type updated successfully",
      wasteInvoiceType: type,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWasteInvoiceType = async (req, res) => {
  try {
    await wasteInvoiceTypeService.deleteWasteInvoiceType(req.params.id);
    res.status(200).json({
      message: "Waste invoice type deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Optional: if you want next code endpoint
// export const getNextWasteInvoiceCodeController = async (req, res) => {
//   try {
//     const nextCode = await getNextWasteInvoiceCode();
//     res.status(200).json({ nextCode });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to generate next code", error: error.message });
//   }
// };