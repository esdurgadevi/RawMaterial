import db from "../../../models/index.js";

const { BreakerDrawing, SpinningCount, SimplexMachine } = db;

export const create = async (data, userId) => {
  return await BreakerDrawing.create({
    ...data,
    createdBy: userId,
  });
};

export const getAll = async () => {
  return await BreakerDrawing.findAll({
    include: [
      { model: SpinningCount, as: "count", attributes: ["id", "name"] },
      { model: SimplexMachine, as: "machine", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const getById = async (id) => {
  const entry = await BreakerDrawing.findByPk(id, {
    include: [
      { model: SpinningCount, as: "count", attributes: ["id", "name"] },
      { model: SimplexMachine, as: "machine", attributes: ["id", "name"] },
    ],
  });

  if (!entry) throw new Error("Entry not found");
  return entry;
};

export const update = async (id, data, userId) => {
  const entry = await BreakerDrawing.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  return await entry.update({
    ...data,
    updatedBy: userId,
  });
};

export const remove = async (id) => {
  const entry = await BreakerDrawing.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  await entry.destroy();
};
