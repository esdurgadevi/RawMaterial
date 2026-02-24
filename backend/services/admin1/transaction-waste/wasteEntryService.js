import db from "../../../models/index.js";

const {
  sequelize,
  WasteEntry,
  WasteEntryDetail,
  WasteMaster,
  PackingType,
  Godown,
} = db;

//////////////////////////////////////////////////////
// CREATE
//////////////////////////////////////////////////////
export const create = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    if (
      !data.date ||
      !data.shift ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details");
    }

    let calculatedTotal = 0;

    const detailsToCreate = data.details.map((detail) => {
      const netWt = parseFloat(detail.netWeight) || 0;
      calculatedTotal += netWt;

      return {
        wasteMasterId: detail.wasteMasterId,
        packingTypeId: detail.packingTypeId,
        godownId: detail.godownId,
        netWeight: netWt,
      };
    });

    // create master entry
    const entry = await WasteEntry.create(
      {
        date: data.date,
        shift: data.shift || "ALL",
        totalNetWeight: calculatedTotal,
        remarks: data.remarks || null,
      },
      { transaction }
    );

    // create details
    await WasteEntryDetail.bulkCreate(
      detailsToCreate.map((d) => ({
        ...d,
        wasteEntryId: entry.id,
      })),
      { transaction }
    );

    await transaction.commit();

    return await getById(entry.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//////////////////////////////////////////////////////
// GET ALL
//////////////////////////////////////////////////////
export const getAll = async (filters = {}) => {
  const where = {};

  if (filters.date) where.date = filters.date;
  if (filters.shift) where.shift = filters.shift;

  return await WasteEntry.findAll({
    where,
    include: [
      {
        model: WasteEntryDetail,
        as: "details",
        include: [
          {
            model: WasteMaster,
            as: "waste",
            attributes: ["id", "department", "waste"],
          },
          {
            model: PackingType,
            as: "packingType",
            attributes: ["id", "name", "tareWeight"],
          },
          {
            model: Godown,
            as: "godown",
            attributes: ["id", "godownName", "locationName"],
          },
        ],
      },
    ],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

//////////////////////////////////////////////////////
// GET BY ID
//////////////////////////////////////////////////////
export const getById = async (id) => {
  const entry = await WasteEntry.findByPk(id, {
    include: [
      {
        model: WasteEntryDetail,
        as: "details",
        include: [
          {
            model: WasteMaster,
            as: "waste",
            attributes: ["id", "department", "waste"],
          },
          {
            model: PackingType,
            as: "packingType",
            attributes: ["id", "name", "tareWeight"],
          },
          {
            model: Godown,
            as: "godown",
            attributes: ["id", "godownName", "locationName"],
          },
        ],
      },
    ],
  });

  if (!entry) {
    throw new Error("Waste entry not found");
  }

  return entry;
};

//////////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////////
export const update = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const entry = await WasteEntry.findByPk(id, { transaction });

    if (!entry) {
      throw new Error("Waste entry not found");
    }

    let calculatedTotal = entry.totalNetWeight;

    // if details updated
    if (data.details && Array.isArray(data.details)) {
      calculatedTotal = 0;

      const newDetails = data.details.map((detail) => {
        const netWt = parseFloat(detail.netWeight) || 0;
        calculatedTotal += netWt;

        return {
          wasteEntryId: id,
          wasteMasterId: detail.wasteMasterId,
          packingTypeId: detail.packingTypeId,
          godownId: detail.godownId,
          netWeight: netWt,
        };
      });

      // remove old
      await WasteEntryDetail.destroy({
        where: { wasteEntryId: id },
        transaction,
      });

      // insert new
      await WasteEntryDetail.bulkCreate(newDetails, { transaction });
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

    return await getById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////
export const remove = async (id) => {
  const entry = await WasteEntry.findByPk(id);

  if (!entry) {
    throw new Error("Waste entry not found");
  }

  // CASCADE deletes details automatically
  await entry.destroy();

  return true;
};
