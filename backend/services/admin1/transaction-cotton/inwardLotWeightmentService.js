// services/inwardLotWeightmentService.js
import db from "../../../models/index.js";


const { InwardLot, InwardLotWeightment } = db;

export const create = async (lotNo, rows) => {
  const lot = await InwardLot.findOne({ where: { lotNo } });
  if (!lot) throw new Error("Invalid Lot No");

  await InwardLotWeightment.destroy({ where: { lotNo } });

  const payload = rows.map((r, i) => ({
    lotNo,
    baleNo: `${lotNo}-${String(i + 1).padStart(2, "0")}`,
    grossWeight: r.grossWeight,
    tareWeight: r.tareWeight,
    baleWeight: r.grossWeight - r.tareWeight,
    baleValue: r.baleValue,
  }));
  //console.log("d");
  //console.log(payload);
  return await InwardLotWeightment.bulkCreate(payload);
};

export const getAll = async (lotNo) => {
  return await InwardLotWeightment.findAll({
    where: { lotNo,isIssued:false },
    order: [["baleNo", "ASC"]],
  });
};

export const update = async (lotNo, rows) => {
  return await create(lotNo, rows); // replace strategy
};

export const remove = async (lotNo) => {
  await InwardLotWeightment.destroy({ where: { lotNo } });
};
