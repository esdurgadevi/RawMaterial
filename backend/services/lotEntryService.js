import db from "../models/index.js";
import { getNextLotNo } from "../utils/helpers.js";

const { LotEntry, InwardEntry } = db;

export const createLotEntry = async (data) => {
  const { inwardId } = data;

  if (!inwardId) throw new Error("Inward ID is required");

  // Auto-generate lotNo if not provided
  if (!data.lotNo) {
    data.lotNo = await getNextLotNo();
  }

  // Validate inwardId
  const inward = await InwardEntry.findByPk(inwardId);
  if (!inward) throw new Error("Referenced Inward Entry not found");

  return await LotEntry.create(data);
};

export const getAllLotEntries = async () => {
  return await LotEntry.findAll({
    include: [{ model: InwardEntry, as: "inwardEntry", attributes: ["id", "inwardNo"] }],
    order: [["createdAt", "DESC"]],
  });
};

export const getLotEntryById = async (id) => {
  const entry = await LotEntry.findByPk(id, {
    include: [{ model: InwardEntry, as: "inwardEntry" }],
  });
  if (!entry) throw new Error("Lot entry not found");
  return entry;
};

export const updateLotEntry = async (id, data) => {
  const entry = await LotEntry.findByPk(id);
  if (!entry) throw new Error("Lot entry not found");

  if (data.inwardId && data.inwardId !== entry.inwardId) {
    const inward = await InwardEntry.findByPk(data.inwardId);
    if (!inward) throw new Error("Referenced Inward Entry not found");
  }

  return await entry.update(data);
};

export const deleteLotEntry = async (id) => {
  const entry = await LotEntry.findByPk(id);
  if (!entry) throw new Error("Lot entry not found");
  await entry.destroy();
};