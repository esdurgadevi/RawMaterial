import db from "../../../models/index.js";

import { getNextInwardNo } from "../../../utils/helpers.js";


const { InwardEntry, PurchaseOrder, Godown } = db;

/* =========================
   CREATE INWARD ENTRY
========================= */
export const createInwardEntry = async (data) => {
  if (!data.inwardDate) {
    throw new Error("Inward Date is required");
  }

  // Auto-generate inward number
  if (!data.inwardNo) {
    data.inwardNo = await getNextInwardNo();
  }

  // Remove deprecated field if frontend still sends it
  delete data.coolyBale;

  // Validate Purchase Order
  if (data.purchaseOrderId) {
    const order = await PurchaseOrder.findByPk(data.purchaseOrderId);
    if (!order) throw new Error("Referenced Purchase Order not found");
  }

  // Validate Godown
  if (data.godownId) {
    const godown = await Godown.findByPk(data.godownId);
    if (!godown) throw new Error("Godown not found");
  }

  /* ===== TAX CALCULATION ===== */
  const taxableAmount =
    Number(data.freight || 0) +
    Number(data.cooly || 0) +
    Number(data.bale || 0);

  // Validate tax rule
  if (data.igst && (data.sgst || data.cgst)) {
    throw new Error("IGST cannot be applied together with SGST/CGST");
  }

  data.sgstAmount = data.sgst
    ? (taxableAmount * data.sgst) / 100
    : 0;

  data.cgstAmount = data.cgst
    ? (taxableAmount * data.cgst) / 100
    : 0;

  data.igstAmount = data.igst
    ? (taxableAmount * data.igst) / 100
    : 0;

  data.taxAmount =
    data.sgstAmount + data.cgstAmount + data.igstAmount;

  return await InwardEntry.create(data);
};

/* =========================
   GET ALL INWARD ENTRIES
========================= */
export const getAllInwardEntries = async () => {
  return await InwardEntry.findAll({
    include: [
      { model: PurchaseOrder, as: "purchaseOrder", attributes: ["id", "orderNo"] },
      { model: Godown, as: "godown", attributes: ["id", "godownName"] },
    ],
    order: [["inwardDate", "DESC"]],
  });
};

/* =========================
   GET INWARD ENTRY BY ID
========================= */
export const getInwardEntryById = async (id) => {
  const entry = await InwardEntry.findByPk(id, {
    include: [
      { model: PurchaseOrder, as: "purchaseOrder" },
      { model: Godown, as: "godown" },
    ],
  });

  if (!entry) {
    throw new Error("Inward entry not found");
  }

  return entry;
};

/* =========================
   UPDATE INWARD ENTRY
========================= */
export const updateInwardEntry = async (id, data) => {
  const entry = await InwardEntry.findByPk(id);
  if (!entry) throw new Error("Inward entry not found");

  // Remove deprecated field
  delete data.coolyBale;

  // Validate Purchase Order
  if (data.purchaseOrderId) {
    const order = await PurchaseOrder.findByPk(data.purchaseOrderId);
    if (!order) throw new Error("Referenced Purchase Order not found");
  }

  // Validate Godown
  if (data.godownId) {
    const godown = await Godown.findByPk(data.godownId);
    if (!godown) throw new Error("Godown not found");
  }

  /* ===== TAX RECALCULATION ===== */
  const taxableAmount =
    Number(data.freight ?? entry.freight ?? 0) +
    Number(data.cooly ?? entry.cooly ?? 0) +
    Number(data.bale ?? entry.bale ?? 0);

  if (data.igst && (data.sgst || data.cgst)) {
    throw new Error("IGST cannot be applied together with SGST/CGST");
  }

  const sgst = data.sgst ?? entry.sgst;
  const cgst = data.cgst ?? entry.cgst;
  const igst = data.igst ?? entry.igst;

  data.sgstAmount = sgst ? (taxableAmount * sgst) / 100 : 0;
  data.cgstAmount = cgst ? (taxableAmount * cgst) / 100 : 0;
  data.igstAmount = igst ? (taxableAmount * igst) / 100 : 0;

  data.taxAmount =
    data.sgstAmount + data.cgstAmount + data.igstAmount;

  return await entry.update(data);
};

/* =========================
   DELETE INWARD ENTRY
========================= */
export const deleteInwardEntry = async (id) => {
  const entry = await InwardEntry.findByPk(id);
  if (!entry) throw new Error("Inward entry not found");
  await entry.destroy();
};
