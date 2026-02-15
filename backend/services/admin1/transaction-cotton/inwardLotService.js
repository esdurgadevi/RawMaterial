// services/inwardLotService.js
import db from "../../../models/index.js";


const { InwardEntry, InwardLot } = db;

export const create = async (data) => {
  const inward = await InwardEntry.findOne({
    where: { id: data.inwardId },
  });
  if(!inward) throw new Error("Invalid Inward No");

  return await InwardLot.create({
    ...data,
    inwardId: inward.id,   // ✅ THIS IS THE KEY FIX
  });
};

export const getAll = async () => {
  return await InwardLot.findAll({ order: [["lotNo", "ASC"]] });
};

export const getByLotNo = async (lotNo) => {
  const lot = await InwardLot.findOne({ where: { lotNo,isIssued:false } });
  if (!lot) throw new Error("Lot not found");
  return lot;
};

export const update = async (lotNo, data) => {
  const lot = await InwardLot.findOne({ where: { lotNo } });
  if (!lot) throw new Error("Lot not found");

  return await lot.update(data);
};

export const remove = async (lotNo) => {
  const lot = await InwardLot.findOne({ where: { lotNo } });
  if (!lot) throw new Error("Lot not found");

  await lot.destroy();
};
