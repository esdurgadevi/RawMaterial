import db from "../models/index.js";
const { WasteInvoiceType } = db;

export const createWasteInvoiceType = async (data) => {
  if (!data.code || !data.invoiceType) {
    throw new Error("Code and Invoice Type name are required");
  }

  const existing = await WasteInvoiceType.findOne({
    where: { code: data.code },
  });
  if (existing) {
    throw new Error("Invoice code already exists");
  }

  return await WasteInvoiceType.create({
    ...data,
    invoiceType: data.invoiceType.trim(),
  });
};

export const getAllWasteInvoiceTypes = async () => {
  return await WasteInvoiceType.findAll({
    order: [["code", "ASC"]],
  });
};

export const getWasteInvoiceTypeById = async (id) => {
  const type = await WasteInvoiceType.findByPk(id);
  if (!type) {
    throw new Error("Waste invoice type not found");
  }
  return type;
};

export const updateWasteInvoiceType = async (id, data) => {
  const type = await WasteInvoiceType.findByPk(id);
  if (!type) {
    throw new Error("Waste invoice type not found");
  }

  if (data.code && data.code !== type.code) {
    const existing = await WasteInvoiceType.findOne({
      where: {
        code: data.code,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });
    if (existing) {
      throw new Error("Invoice code already in use");
    }
  }

  return await type.update({
    ...data,
    invoiceType: data.invoiceType ? data.invoiceType.trim() : type.invoiceType,
  });
};

export const deleteWasteInvoiceType = async (id) => {
  const type = await WasteInvoiceType.findByPk(id);
  if (!type) {
    throw new Error("Waste invoice type not found");
  }
  await type.destroy();
  return true;
};