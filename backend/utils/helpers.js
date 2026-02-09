// utils/helpers.js
import { Op } from "sequelize";
import db from "../models/index.js";

const { PurchaseOrder } = db;
const { InwardEntry } = db;
const { InwardLot } = db;

/**
 * Returns the NEXT auto-generated Purchase Order number
 * Format: PO/YY-YY/XXXX
 * - Resets every financial year (April 1 - March 31)
 * - Does NOT save to database — just calculates
 */
export const getNextPurchaseOrderNo = async () => {
  const now = new Date();
  let year = now.getFullYear();

  // Financial year: April 1 to March 31
  if (now.getMonth() < 3) { // Jan-Mar → still previous FY
    year = year - 1;
  }
  const nextYear = year + 1;
  const fyPrefix = `${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

  // Find last order in this FY
  const lastOrder = await PurchaseOrder.findOne({
    where: {
      orderNo: {
        [Op.like]: `PO/${fyPrefix}/%`,
      },
    },
    order: [["createdAt", "DESC"]], // or use orderNo DESC if you prefer
    limit: 1,
  });

  let nextSeq = 1;
  if (lastOrder) {
    const parts = lastOrder.orderNo.split("/");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }

  const padded = String(nextSeq).padStart(4, "0");
  return `PO/${fyPrefix}/${padded}`;
};

export const getNextInwardNo = async () => {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() < 3) year -= 1; // Jan-Mar belongs to previous FY
  const nextYear = year + 1;
  const fyPrefix = `${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

  const lastEntry = await InwardEntry.findOne({
    where: {
      inwardNo: {
        [Op.like]: `GI/${fyPrefix}/%`,
      },
    },
    order: [["inwardNo", "DESC"]],
    limit: 1,
  });

  let nextSeq = 1;
  if (lastEntry) {
    const lastPart = lastEntry.inwardNo.split("/").pop();
    const lastNum = parseInt(lastPart, 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }

  const padded = String(nextSeq).padStart(4, "0");
  return `GI/${fyPrefix}/${padded}`;
};

export const getNextLotNo = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear() % 100;
    const nextYear = year + 1;
    const financialYear = `${year}-${nextYear}`;

    const lastLot = await InwardLot.findOne({
      where: {
        lotNo: {
          [Op.like]: `LOT/${financialYear}/%`
        }
      },
      order: [["lotNo", "DESC"]]
    });

    let nextSeq = 1;

    if (lastLot && lastLot.lotNo) {
      const lastNumber = lastLot.lotNo.split("/").pop();
      nextSeq = parseInt(lastNumber, 10) + 1;
    }

    return `LOT/${financialYear}/${String(nextSeq).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating next lot no:", error);
    throw error;
  }
};

const { Issue } = db;

export const getNextIssueNumber = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear() % 100;
    const nextYear = year + 1;
    const financialYear = `${year}-${nextYear}`;

    const lastIssue = await Issue.findOne({
      where: {
        issueNumber: {
          [Op.like]: `ISSUE/${financialYear}/%`,
        },
      },
      order: [["issueNumber", "DESC"]],
    });
    let nextSeq = 1;

    if (lastIssue && lastIssue.issueNumber) {
      const lastNumber = lastIssue.issueNumber.split("/").pop();
      nextSeq = parseInt(lastNumber, 10) + 1;
    }

    return `ISSUE/${financialYear}/${String(nextSeq).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating next issue number:", error);
    throw error;
  }
};

const { Broker } = db;

export const getNextBrokerCode = async () => {
  try {
    const result = await Broker.findOne({
      attributes: [
        [Broker.sequelize.fn("MAX", Broker.sequelize.col("brokerCode")), "maxCode"],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating broker code:", error);
    throw error;
  }
};

const { Commodity } = db;

export const getNextCommodityCode = async () => {
  try {
    const result = await Commodity.findOne({
      attributes: [
        [
          Commodity.sequelize.fn(
            "MAX",
            Commodity.sequelize.col("commodityCode")
          ),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating commodity code:", error);
    throw error;
  }
};

const { CompanyBroker } = db;

export const getNextCompanyBrokerCode = async () => {
  try {
    const result = await CompanyBroker.findOne({
      attributes: [
        [
          CompanyBroker.sequelize.fn(
            "MAX",
            CompanyBroker.sequelize.col("code")
          ),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating company broker code:", error);
    throw error;
  }
};

const { Fibre } = db;

export const getNextFibreCode = async () => {
  try {
    const result = await Fibre.findOne({
      attributes: [
        [Fibre.sequelize.fn("MAX", Fibre.sequelize.col("code")), "maxCode"],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating fibre code:", error);
    throw error;
  }
};

const { Godown } = db;

export const getNextGodownCode = async () => {
  try {
    const result = await Godown.findOne({
      attributes: [
        [Godown.sequelize.fn("MAX", Godown.sequelize.col("code")), "maxCode"],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating godown code:", error);
    throw error;
  }
};

const { Mixing } = db;

export const getNextMixingCode = async () => {
  try {
    const result = await Mixing.findOne({
      attributes: [
        [
          Mixing.sequelize.fn("MAX", Mixing.sequelize.col("mixing_code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating mixing code:", error);
    throw error;
  }
};

const { MixingGroup } = db;

export const getNextMixingCode1 = async () => {
  try {
    const result = await Mixing.findOne({
      attributes: [
        [
          Mixing.sequelize.fn("MAX", MixingGroup.sequelize.col("mixing_code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating mixing code:", error);
    throw error;
  }
};

const { PackingType } = db;

export const getNextPackingTypeCode = async () => {
  try {
    const result = await PackingType.findOne({
      attributes: [
        [
          PackingType.sequelize.fn("MAX", PackingType.sequelize.col("code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating packing type code:", error);
    throw error;
  }
};

const { State } = db;

export const getNextStateCode = async () => {
  try {
    const result = await State.findOne({
      attributes: [
        [
          State.sequelize.fn("MAX", State.sequelize.col("code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating state code:", error);
    throw error;
  }
};

const { Station } = db;

export const getNextStationCode = async () => {
  try {
    const result = await Station.findOne({
      attributes: [
        [
          Station.sequelize.fn("MAX", Station.sequelize.col("code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating station code:", error);
    throw error;
  }
};
const { Supplier } = db;

export const getNextSupplierCode = async () => {
  try {
    const result = await Supplier.findOne({
      attributes: [
        [Supplier.sequelize.fn("MAX", Supplier.sequelize.col("code")), "maxCode"],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode;

    if (!maxCode) return "1";

    // if numeric string
    const nextCode = (parseInt(maxCode, 10) + 1).toString();
    return nextCode;
  } catch (error) {
    console.error("Error generating supplier code:", error);
    throw error;
  }
};

const { Transport } = db;

export const getNextTransportCode = async () => {
  const result = await Transport.findOne({
    attributes: [
      [
        Transport.sequelize.fn(
          "MAX",
          Transport.sequelize.col("transportCode")
        ),
        "maxCode",
      ],
    ],
    raw: true,
  });

  const maxCode = result?.maxCode || 0;
  return maxCode + 1;
};

const { Variety } = db;

export const getNextVarietyCode = async () => {
  const result = await Variety.findOne({
    attributes: [
      [
        Variety.sequelize.fn("MAX", Variety.sequelize.col("code")),
        "maxCode",
      ],
    ],
    raw: true,
  });

  const maxCode = result?.maxCode || 0;
  return maxCode + 1;
};
const { WasteMaster } = db;

export const getNextWasteMasterCode = async () => {
  const result = await WasteMaster.findOne({
    attributes: [
      [
        WasteMaster.sequelize.fn("MAX", WasteMaster.sequelize.col("code")),
        "maxCode",
      ],
    ],
    raw: true,
  });

  const maxCode = result?.maxCode || 0;
  return maxCode + 1;
};