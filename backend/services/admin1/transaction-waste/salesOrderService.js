// services/salesOrderService.js
import db from "../../../models/index.js";
import { Op } from "sequelize";

const { SalesOrder, SalesOrderDetail, Supplier, WastePackingDetail, WastePacking, InvoiceDetail } = db;

export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Validation
    if (
      !data.orderNo ||
      !data.date ||
      !data.supplierId ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    // Unique orderNo
    const existing = await SalesOrder.findOne({
      where: { orderNo: data.orderNo },
    });

    if (existing) {
      throw new Error("Order number already exists");
    }

    // Validate detail rows
    data.details.forEach((detail) => {
      if (
        !detail.product ||
        !detail.packingId ||
        !detail.qty ||
        !detail.totalWt ||
        !detail.rate ||
        !detail.value
      ) {
        throw new Error("Missing required fields in details");
      }
    });

    // Create Sales Order
    const order = await SalesOrder.create(
      {
        orderNo: data.orderNo,
        date: data.date,
        supplierId: data.supplierId,
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

    // Insert details
    await SalesOrderDetail.bulkCreate(
      data.details.map((d) => ({
        salesOrderId: order.id,
        product: d.product,
        packingId: d.packingId,
        qty: d.qty,
        totalWt: d.totalWt,
        rate: d.rate,
        ratePer: d.ratePer,
        value: d.value,
      })),
      { transaction }
    );

    await transaction.commit();

    return await SalesOrder.findByPk(order.id, {
      include: [
        { model: SalesOrderDetail, as: "details" },
        { model: Supplier, as: "supplier" },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async () => {
  return await SalesOrder.findAll({
    include: [
      {
        model: SalesOrderDetail,
        as: "details",
        include: [{ model: WastePacking, as: "packing" }],
      },
      { model: Supplier, as: "supplier" },
    ],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const order = await SalesOrder.findByPk(id, {
    include: [
      {
        model: SalesOrderDetail,
        as: "details",
        include: [{ model: WastePacking, as: "packing" }],
      },
      { model: Supplier, as: "supplier" },
    ],
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

    // orderNo uniqueness check
    if (data.orderNo && data.orderNo !== order.orderNo) {
      const existing = await SalesOrder.findOne({
        where: { orderNo: data.orderNo, id: { [Op.ne]: id } },
      });

      if (existing) {
        throw new Error("Order number already exists");
      }
    }

    // Update header
    await order.update(
      {
        orderNo: data.orderNo ?? order.orderNo,
        date: data.date ?? order.date,
        supplierId: data.supplierId ?? order.supplierId,
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

    // Replace details if provided
    if (data.details && Array.isArray(data.details) && data.details.length > 0) {

      data.details.forEach((detail) => {
        if (
          !detail.product ||
          !detail.packingId ||
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
          packingId: d.packingId,
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
      include: [
        { model: SalesOrderDetail, as: "details" },
        { model: Supplier, as: "supplier" },
      ],
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

  await order.destroy();
};

export const getAvailableBales = async (salesOrderId, excludeInvoiceId) => {
  const order = await SalesOrder.findByPk(salesOrderId, {
    include: [{ model: SalesOrderDetail, as: "details" }],
  });

  if (!order) {
    throw new Error("Sales order not found");
  }

  const packingIds = order.details.map((d) => d.packingId).filter(Boolean);

  if (packingIds.length === 0) {
    return [];
  }

  const allBales = await WastePackingDetail.findAll({
    where: { wastePackingId: packingIds },
    include: [
      {
        model: WastePacking,
        as: "packing",
      },
    ],
  });

  const invoiceWhereClause = {};
  if (excludeInvoiceId) {
    invoiceWhereClause.invoiceId = { [Op.ne]: excludeInvoiceId };
  }
  const invoicedDetails = await InvoiceDetail.findAll({
    where: invoiceWhereClause,
    attributes: ["baleNo"],
  });

  const invoicedBaleNos = new Set(invoicedDetails.map((id) => id.baleNo));

  const availableBales = allBales.filter((bale) => !invoicedBaleNos.has(bale.baleNo));

  return availableBales.map((bale) => ({
    id: bale.id,
    baleNo: bale.baleNo,
    wasteName: bale.packing?.wasteType || "COMBER NOILS",
    lotNo: bale.packing?.lotNo || "",
    grossWt: parseFloat(bale.grossWeight),
    tareWt: parseFloat(bale.tareWeight) || 0,
    netWt: parseFloat(bale.netWeight),
    packingId: bale.wastePackingId,
  }));
};