import db from "../models/index.js";
import { Op } from "sequelize";

const { WasteEntry, WasteEntryDetail } = db;

export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    if (
      !data.date ||
      !data.shift ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    let calculatedTotal = 0;

    const detailsToCreate = data.details.map((detail) => {
      const netWt = parseFloat(detail.netWeight) || 0;
      calculatedTotal += netWt;

      return {
        department: detail.department?.trim(),
        wasteType: detail.wasteType?.trim(),
        packingType: detail.packingType?.trim(),
        netWeight: netWt,
        godown: detail.godown?.trim(),
      };
    });

    const entry = await WasteEntry.create(
      {
        date: data.date,
        shift: data.shift?.trim() || "ALL",
        totalNetWeight: calculatedTotal,
        remarks: data.remarks?.trim(),
      },
      { transaction }
    );

    await WasteEntryDetail.bulkCreate(
      detailsToCreate.map((d) => ({
        ...d,
        wasteEntryId: entry.id,
      })),
      { transaction }
    );

    await transaction.commit();

    return await WasteEntry.findByPk(entry.id, {
      include: [{ model: WasteEntryDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async (filters = {}) => {
  const where = {};

  if (filters.date) where.date = filters.date;
  if (filters.shift) where.shift = filters.shift;

  return await WasteEntry.findAll({
    where,
    include: [{ model: WasteEntryDetail, as: "details" }],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const entry = await WasteEntry.findByPk(id, {
    include: [{ model: WasteEntryDetail, as: "details" }],
  });

  if (!entry) {
    throw new Error("Waste entry not found");
  }

  return entry;
};

export const update = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const entry = await WasteEntry.findByPk(id, { transaction });
    if (!entry) {
      throw new Error("Waste entry not found");
    }

    let calculatedTotal = entry.totalNetWeight;

    if (data.details && Array.isArray(data.details)) {
      calculatedTotal = 0;
      const newDetails = data.details.map((detail) => {
        const netWt = parseFloat(detail.netWeight) || 0;
        calculatedTotal += netWt;

        return {
          department: detail.department?.trim(),
          wasteType: detail.wasteType?.trim(),
          packingType: detail.packingType?.trim(),
          netWeight: netWt,
          godown: detail.godown?.trim(),
        };
      });

      await WasteEntryDetail.destroy({
        where: { wasteEntryId: id },
        transaction,
      });

      await WasteEntryDetail.bulkCreate(
        newDetails.map((d) => ({ ...d, wasteEntryId: id })),
        { transaction }
      );
    }

    await entry.update(
      {
        date: data.date ?? entry.date,
        shift: data.shift ?? entry.shift,
        totalNetWeight: calculatedTotal,
        remarks: data.remarks ?? entry.remarks,
      },
      { transaction }
    );

    await transaction.commit();

    return await WasteEntry.findByPk(id, {
      include: [{ model: WasteEntryDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const remove = async (id) => {
  const entry = await WasteEntry.findByPk(id);
  if (!entry) {
    throw new Error("Waste entry not found");
  }
  await entry.destroy(); // cascades to details
};