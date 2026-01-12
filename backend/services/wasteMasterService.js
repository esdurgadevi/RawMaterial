import db from "../models/index.js";

const { WasteMaster, PackingType } = db;

export const createWasteMaster = async (data) => {
  const { code, department, waste, packingTypeId, wasteKg } = data;

  if (!code || !department || !waste || !packingTypeId || wasteKg === undefined) {
    throw new Error("Code, Department, Waste, Packing Type, and Waste Kg are required");
  }

  // Check unique code
  const existingCode = await WasteMaster.findOne({ where: { code } });
  if (existingCode) {
    throw new Error("Waste code already exists");
  }

  // Validate packing type exists
  const packing = await PackingType.findByPk(packingTypeId);
  if (!packing) {
    throw new Error("Selected Packing Type not found");
  }

  return await WasteMaster.create({
    code,
    department: department.trim(),
    waste: waste.trim(),
    packingTypeId,
    wasteKg: parseFloat(wasteKg),
    hsnCode: data.hsnCode ? data.hsnCode.trim() : null,
    packingPreWeightment: data.packingPreWeightment ?? false,
  });
};

export const getAllWasteMasters = async () => {
  return await WasteMaster.findAll({
    include: [
      { model: PackingType, as: "packingType", attributes: ["id", "code", "name"] },
    ],
    order: [["code", "ASC"]],
  });
};

export const getWasteMasterById = async (id) => {
  const waste = await WasteMaster.findByPk(id, {
    include: [
      { model: PackingType, as: "packingType", attributes: ["id", "code", "name"] },
    ],
  });
  if (!waste) {
    throw new Error("Waste master not found");
  }
  return waste;
};

export const updateWasteMaster = async (id, data) => {
  const waste = await WasteMaster.findByPk(id);
  if (!waste) {
    throw new Error("Waste master not found");
  }

  if (data.code && data.code !== waste.code) {
    const existing = await WasteMaster.findOne({
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Waste code already in use");
    }
  }

  if (data.packingTypeId && data.packingTypeId !== waste.packingTypeId) {
    const packing = await PackingType.findByPk(data.packingTypeId);
    if (!packing) {
      throw new Error("Selected Packing Type not found");
    }
  }

  return await waste.update({
    code: data.code !== undefined ? data.code : waste.code,
    department: data.department ? data.department.trim() : waste.department,
    waste: data.waste ? data.waste.trim() : waste.waste,
    packingTypeId: data.packingTypeId !== undefined ? data.packingTypeId : waste.packingTypeId,
    wasteKg: data.wasteKg !== undefined ? parseFloat(data.wasteKg) : waste.wasteKg,
    hsnCode: data.hsnCode !== undefined ? (data.hsnCode ? data.hsnCode.trim() : null) : waste.hsnCode,
    packingPreWeightment:
      data.packingPreWeightment !== undefined
        ? data.packingPreWeightment
        : waste.packingPreWeightment,
  });
};

export const deleteWasteMaster = async (id) => {
  const waste = await WasteMaster.findByPk(id);
  if (!waste) {
    throw new Error("Waste master not found");
  }
  await waste.destroy();
};