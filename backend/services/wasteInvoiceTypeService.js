import db from "../models/index.js";

const { WasteInvoiceType } = db;

export const createWasteInvoiceType = async (data) => {
  const { code, invoiceType } = data;

  if (!code || !invoiceType) {
    throw new Error("Code and Invoice Type are required");
  }

  const existing = await WasteInvoiceType.findOne({ where: { code } });
  if (existing) {
    throw new Error("Invoice type code already exists");
  }

  return await WasteInvoiceType.create({
    code,
    invoiceType: invoiceType.trim(),
    assessValue: data.assessValue ?? false,
    charity: data.charity ?? false,
    tax: data.tax ?? false,
    gst: data.gst ?? true,
    igst: data.igst ?? false,
    duty: data.duty ?? false,
    cess: data.cess ?? false,
    hrSecCess: data.hrSecCess ?? false,
    tcs: data.tcs ?? false,
    cst: data.cst ?? false,
    cenvat: data.cenvat ?? false,
    subTotal: data.subTotal ?? true,
    totalValue: data.totalValue ?? true,
    roundOff: data.roundOff ?? true,
    packingForwardingCharges: data.packingForwardingCharges ?? false,
    roundOffDigits: data.roundOffDigits ?? 0,
    gstPercentage: data.gstPercentage ?? 0,
    cgstPercentage: data.cgstPercentage ?? 0,
    sgstPercentage: data.sgstPercentage ?? 0,
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
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Invoice type code already in use");
    }
  }

  return await type.update({
    code: data.code !== undefined ? data.code : type.code,
    invoiceType: data.invoiceType ? data.invoiceType.trim() : type.invoiceType,
    assessValue: data.assessValue !== undefined ? data.assessValue : type.assessValue,
    charity: data.charity !== undefined ? data.charity : type.charity,
    tax: data.tax !== undefined ? data.tax : type.tax,
    gst: data.gst !== undefined ? data.gst : type.gst,
    igst: data.igst !== undefined ? data.igst : type.igst,
    duty: data.duty !== undefined ? data.duty : type.duty,
    cess: data.cess !== undefined ? data.cess : type.cess,
    hrSecCess: data.hrSecCess !== undefined ? data.hrSecCess : type.hrSecCess,
    tcs: data.tcs !== undefined ? data.tcs : type.tcs,
    cst: data.cst !== undefined ? data.cst : type.cst,
    cenvat: data.cenvat !== undefined ? data.cenvat : type.cenvat,
    subTotal: data.subTotal !== undefined ? data.subTotal : type.subTotal,
    totalValue: data.totalValue !== undefined ? data.totalValue : type.totalValue,
    roundOff: data.roundOff !== undefined ? data.roundOff : type.roundOff,
    packingForwardingCharges:
      data.packingForwardingCharges !== undefined
        ? data.packingForwardingCharges
        : type.packingForwardingCharges,
    roundOffDigits: data.roundOffDigits !== undefined ? data.roundOffDigits : type.roundOffDigits,
    gstPercentage: data.gstPercentage !== undefined ? data.gstPercentage : type.gstPercentage,
    cgstPercentage: data.cgstPercentage !== undefined ? data.cgstPercentage : type.cgstPercentage,
    sgstPercentage: data.sgstPercentage !== undefined ? data.sgstPercentage : type.sgstPercentage,
  });
};

export const deleteWasteInvoiceType = async (id) => {
  const type = await WasteInvoiceType.findByPk(id);
  if (!type) {
    throw new Error("Waste invoice type not found");
  }
  await type.destroy();
};