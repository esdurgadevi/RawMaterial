import db from "../models/index.js";
import { getNextInwardNo } from "../utils/helpers.js";

const { InwardEntry, PurchaseOrder, Godown } = db;

export const createInwardEntry = async (data) => {
  if (!data.inwardDate) throw new Error("Inward Date is required");

  if (!data.inwardNo) {
    data.inwardNo = await getNextInwardNo();
  }

  // Validate purchaseOrderId if provided
  if (data.purchaseOrderId) {
    const order = await PurchaseOrder.findByPk(data.purchaseOrderId);
    if (!order) throw new Error("Referenced Purchase Order not found");
  }

  // Validate godownId if provided
  if (data.godownId) {
    const godown = await Godown.findByPk(data.godownId);
    if (!godown) throw new Error("Godown not found");
  }

  return await InwardEntry.create(data);
};

export const getAllInwardEntries = async () => {
  return await InwardEntry.findAll({
    include: [
      { model: PurchaseOrder, as: "purchaseOrder", attributes: ["id", "orderNo"] },
      { model: Godown, as: "godown", attributes: ["id", "godownName"] },
    ],
    order: [["inwardDate", "DESC"]],
  });
};

export const getInwardEntryById = async (id) => {
  const entry = await InwardEntry.findByPk(id, {
    include: [
      { model: PurchaseOrder, as: "purchaseOrder" },
      { model: Godown, as: "godown" },
    ],
  });
  if (!entry) throw new Error("Inward entry not found");
  return entry;
};

export const updateInwardEntry = async (id, data) => {
  const entry = await InwardEntry.findByPk(id);
  if (!entry) throw new Error("Inward entry not found");

  if (data.purchaseOrderId) {
    const order = await PurchaseOrder.findByPk(data.purchaseOrderId);
    if (!order) throw new Error("Referenced Purchase Order not found");
  }

  if (data.godownId) {
    const godown = await Godown.findByPk(data.godownId);
    if (!godown) throw new Error("Godown not found");
  }

  return await entry.update(data);
};

export const deleteInwardEntry = async (id) => {
  const entry = await InwardEntry.findByPk(id);
  if (!entry) throw new Error("Inward entry not found");
  await entry.destroy();
};