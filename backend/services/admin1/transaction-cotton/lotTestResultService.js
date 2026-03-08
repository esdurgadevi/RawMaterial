import db from "../../../models/index.js";

const { LotTestResult, InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety, Station } = db;

// ================= CREATE =================
export const createLotTestResultService = async (data) => {
  return await LotTestResult.create(data);
};

// ================= GET ALL =================
export const getAllLotTestResultsService = async () => {
  return await LotTestResult.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: InwardLot,
        as: "lot",
        attributes: ["id", "lotNo", "gross_weight"],
        include: [
          {
            model: InwardEntry,
            attributes: ["id", "bill_no", "bill_date"],
            include: [
              {
                model: PurchaseOrder,
                as: "purchaseOrder",
                attributes: ["id", "candy_rate"],
                include: [
                  { model: Supplier, as: "supplier", attributes: ["id", "accountName"] },
                  { model: Variety, as: "variety", attributes: ["id", "variety"] },
                  { model: Station, as: "station", attributes: ["id", "station"] },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
};

// ================= GET BY ID =================
export const getLotTestResultByIdService = async (id) => {
  return await LotTestResult.findByPk(id, {
    include: [
      {
        model: InwardLot,
        as: "lot",
        attributes: ["id", "lotNo", "gross_weight"],
        include: [
          {
            model: InwardEntry,
            attributes: ["id", "bill_no", "bill_date"],
            include: [
              {
                model: PurchaseOrder,
                as: "purchaseOrder",
                attributes: ["id", "candy_rate"],
                include: [
                  { model: Supplier, as: "supplier", attributes: ["id", "accountName"] },
                  { model: Variety, as: "variety", attributes: ["id", "variety"] },
                  { model: Station, as: "station", attributes: ["id", "station"] },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
};

// ================= UPDATE =================
export const updateLotTestResultService = async (id, data) => {
  const record = await LotTestResult.findByPk(id);
  if (!record) throw new Error("Lot Test Result not found");
  await record.update(data);
  return record;
};

// ================= DELETE =================
export const deleteLotTestResultService = async (id) => {
  const record = await LotTestResult.findByPk(id);
  if (!record) throw new Error("Lot Test Result not found");
  await record.destroy();
  return true;
};