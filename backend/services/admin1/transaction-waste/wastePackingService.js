import db from "../../../models/index.js";


const { WastePacking, WastePackingDetail } = db;

export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Required header fields
    if (
      !data.wasteType ||
      !data.date ||
      !data.lotNo ||
      !data.packingType ||
      !data.noOfBales ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    if (data.details.length !== data.noOfBales) {
      throw new Error(`Number of detail rows (${data.details.length}) must match noOfBales (${data.noOfBales})`);
    }

    // Calculate totals from details
    let calculatedTotalWeight = 0;
    const detailsToCreate = data.details.map((detail, index) => {
      const netWt = parseFloat(detail.netWeight) || 0;
      calculatedTotalWeight += netWt;

      return {
        siNo: index + 1,
        baleNo: detail.baleNo,
        grossWeight: parseFloat(detail.grossWeight) || 0,
        tareWeight: parseFloat(detail.tareWeight) || 0,
        netWeight: netWt,
      };
    });

    if (Math.abs(calculatedTotalWeight - parseFloat(data.totalWeight)) > 0.01) {
      throw new Error("Total weight mismatch: sum of net weights does not match provided totalWeight");
    }

    // Create header
    const packing = await WastePacking.create(
      {
        wasteType: data.wasteType,
        date: data.date,
        lotNo: data.lotNo,
        stock: data.stock ?? 0,
        packingType: data.packingType,
        noOfBales: data.noOfBales,
        totalBales: data.details.length,
        totalWeight: calculatedTotalWeight,
      },
      { transaction }
    );

    // Attach wastePackingId and bulk create details
    await WastePackingDetail.bulkCreate(
      detailsToCreate.map((d) => ({
        ...d,
        wastePackingId: packing.id,
      })),
      { transaction }
    );

    await transaction.commit();

    // Return full created record with details
    return await WastePacking.findByPk(packing.id, {
      include: [{ model: WastePackingDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async () => {
  return await WastePacking.findAll({
    include: [{ model: WastePackingDetail, as: "details" }],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const packing = await WastePacking.findByPk(id, {
    include: [{ model: WastePackingDetail, as: "details", order: [["siNo", "ASC"]] }],
  });

  if (!packing) {
    throw new Error("Waste packing not found");
  }

  return packing;
};

// Update can be more complex (add/remove rows, recalculate totals) – here simple full replace for details
export const update = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const packing = await WastePacking.findByPk(id, { transaction });
    if (!packing) {
      throw new Error("Waste packing not found");
    }

    // Similar validations as create...
    if (!data.details || !Array.isArray(data.details) || data.details.length === 0) {
      throw new Error("Details array is required for update");
    }

    if (data.details.length !== data.noOfBales) {
      throw new Error(`Number of detail rows must match noOfBales`);
    }

    let calculatedTotalWeight = 0;
    const newDetails = data.details.map((d, i) => ({
      siNo: i + 1,
      baleNo: d.baleNo,
      grossWeight: parseFloat(d.grossWeight) || 0,
      tareWeight: parseFloat(d.tareWeight) || 0,
      netWeight: parseFloat(d.netWeight) || 0,
    }));

    newDetails.forEach((d) => {
      calculatedTotalWeight += d.netWeight;
    });

    if (Math.abs(calculatedTotalWeight - parseFloat(data.totalWeight)) > 0.01) {
      throw new Error("Total weight mismatch");
    }

    // Update header
    await packing.update(
      {
        wasteType: data.wasteType ?? packing.wasteType,
        date: data.date ?? packing.date,
        lotNo: data.lotNo ?? packing.lotNo,
        stock: data.stock ?? packing.stock,
        packingType: data.packingType ?? packing.packingType,
        noOfBales: data.noOfBales ?? packing.noOfBales,
        totalBales: newDetails.length,
        totalWeight: calculatedTotalWeight,
      },
      { transaction }
    );

    // Delete old details and insert new ones (simple replace strategy)
    await WastePackingDetail.destroy({
      where: { wastePackingId: id },
      transaction,
    });

    await WastePackingDetail.bulkCreate(
      newDetails.map((d) => ({ ...d, wastePackingId: id })),
      { transaction }
    );

    await transaction.commit();

    return await WastePacking.findByPk(id, {
      include: [{ model: WastePackingDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const remove = async (id) => {
  const packing = await WastePacking.findByPk(id);
  if (!packing) {
    throw new Error("Waste packing not found");
  }
  await packing.destroy(); // Cascades to details
};