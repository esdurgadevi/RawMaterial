import db from "../../../models/index.js";
const { SpinningCount } = db;

export const createSpinningCount = async (data) => {
  if (!data.countName || !data.actCount || !data.noilsPct) {
    throw new Error("Count Name, Actual Count, and Noils% are required");
  }
  const existing = await SpinningCount.findOne({ where: { countName: data.countName } });
  if (existing) throw new Error("Count Name already exists");
  return await SpinningCount.create(data);
};

export const getAllSpinningCounts = async () => {
  return await SpinningCount.findAll({ order: [["countName", "ASC"]] });
};

export const getSpinningCountById = async (id) => {
  const count = await SpinningCount.findByPk(id);
  if (!count) throw new Error("Spinning count not found");
  return count;
};

export const updateSpinningCount = async (id, data) => {
  const count = await SpinningCount.findByPk(id);
  if (!count) throw new Error("Spinning count not found");
  if (data.countName && data.countName !== count.countName) {
    const existing = await SpinningCount.findOne({ where: { countName: data.countName } });
    if (existing) throw new Error("Count Name already in use");
  }
  return await count.update(data);
};

export const deleteSpinningCount = async (id) => {
  const count = await SpinningCount.findByPk(id);
  if (!count) throw new Error("Spinning count not found");
  await count.destroy();
  return true;
};