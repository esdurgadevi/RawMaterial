// utils/helpers.js
import { Op } from "sequelize";
import db from "../models/index.js";

const { PurchaseOrder } = db;
const { InwardEntry } = db;
const { InwardLot } = db;
const { IssueEntry } = db;
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

export const getNextIssueNo = async () => {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() < 3) year -= 1; // Jan-Mar belongs to previous FY
  const nextYear = year + 1;
  const fyPrefix = `${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

  const lastEntry = await IssueEntry.findOne({
    where: {
      issueNo: { [Op.like]: `ISSUE/${fyPrefix}/%` },
    },
    order: [["createdAt", "DESC"]],
    limit: 1,
  });

  let nextSeq = 1;
  if (lastEntry) {
    const lastPart = lastEntry.issueNo.split("/").pop();
    const lastNum = parseInt(lastPart, 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }

  const padded = String(nextSeq).padStart(4, "0");
  return `ISSUE/${fyPrefix}/${padded}`;
};