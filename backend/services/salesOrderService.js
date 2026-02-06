// services/salesOrderService.js
import db from "../models/index.js";
import { Op } from "sequelize";

const { SalesOrder, SalesOrderDetail } = db;

export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Validation: required header fields
    if (
      !data.orderNo ||
      !data.date ||
      !data.party ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    // Unique orderNo check
    const existing = await SalesOrder.findOne({ where: { orderNo: data.orderNo } });
    if (existing) {
      throw new Error("Order number already exists");
    }

    // Optional: Validate each detail has required fields
    data.details.forEach((detail) => {
      if (
        !detail.product ||
        !detail.packingType ||
        !detail.qty ||
        !detail.totalWt ||
        !detail.rate ||
        !detail.value
      ) {
        throw new Error("Missing required fields in details");
      }
    });

    // Create header
    const order = await SalesOrder.create(
      {
        orderNo: data.orderNo,
        date: data.date,
        party: data.party,
        broker: data.broker,
        broker1: data.broker1,
        payTerms: data.payTerms,
        payMode: data.payMode,
        creditDays: data.creditDays,
        bank: data.bank,
        despatchTo: data.despatchTo,
      },
      { transaction }
    );

    // Bulk create details with salesOrderId
    await SalesOrderDetail.bulkCreate(
      data.details.map((d) => ({
        salesOrderId: order.id,
        product: d.product,
        packingType: d.packingType,
        qty: d.qty,
        totalWt: d.totalWt,
        rate: d.rate,
        ratePer: d.ratePer,
        value: d.value,
      })),
      { transaction }
    );

    await transaction.commit();

    // Return full record with details
    return await SalesOrder.findByPk(order.id, {
      include: [{ model: SalesOrderDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async () => {
  return await SalesOrder.findAll({
    include: [{ model: SalesOrderDetail, as: "details" }],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const order = await SalesOrder.findByPk(id, {
    include: [{ model: SalesOrderDetail, as: "details" }],
  });
  if (!order) {
    throw new Error("Sales order not found");
  }
  return order;
};

export const update = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const order = await SalesOrder.findByPk(id, { transaction });
    if (!order) {
      throw new Error("Sales order not found");
    }

    // If updating orderNo, check uniqueness
    if (data.orderNo && data.orderNo !== order.orderNo) {
      const existing = await SalesOrder.findOne({
        where: { orderNo: data.orderNo, id: { [Op.ne]: id } },
      });
      if (existing) {
        throw new Error("Order number already exists");
      }
    }

    // Update header fields (partial)
    await order.update(
      {
        orderNo: data.orderNo ?? order.orderNo,
        date: data.date ?? order.date,
        party: data.party ?? order.party,
        broker: data.broker ?? order.broker,
        broker1: data.broker1 ?? order.broker1,
        payTerms: data.payTerms ?? order.payTerms,
        payMode: data.payMode ?? order.payMode,
        creditDays: data.creditDays ?? order.creditDays,
        bank: data.bank ?? order.bank,
        despatchTo: data.despatchTo ?? order.despatchTo,
      },
      { transaction }
    );

    // If details provided, replace all (simple strategy)
    if (data.details && Array.isArray(data.details) && data.details.length > 0) {
      // Validate details
      data.details.forEach((detail) => {
        if (
          !detail.product ||
          !detail.packingType ||
          !detail.qty ||
          !detail.totalWt ||
          !detail.rate ||
          !detail.value
        ) {
          throw new Error("Missing required fields in details");
        }
      });

      // Delete old details
      await SalesOrderDetail.destroy({
        where: { salesOrderId: id },
        transaction,
      });

      // Insert new details
      await SalesOrderDetail.bulkCreate(
        data.details.map((d) => ({
          salesOrderId: id,
          product: d.product,
          packingType: d.packingType,
          qty: d.qty,
          totalWt: d.totalWt,
          rate: d.rate,
          ratePer: d.ratePer,
          value: d.value,
        })),
        { transaction }
      );
    }

    await transaction.commit();

    return await SalesOrder.findByPk(id, {
      include: [{ model: SalesOrderDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const remove = async (id) => {
  const order = await SalesOrder.findByPk(id);
  if (!order) {
    throw new Error("Sales order not found");
  }
  await order.destroy(); // Cascades to details
};