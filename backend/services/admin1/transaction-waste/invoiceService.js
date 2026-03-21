// services/invoiceService.js
import db from "../../../models/index.js";
import { Op } from "sequelize";

const { Invoice, InvoiceDetail, SalesOrder, Supplier } = db;

export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Validation
    if (
      !data.invoiceNo ||
      !data.date ||
      !data.invoiceType ||
      !data.supplierId ||
      !data.assessableValue ||
      !data.subTotal ||
      !data.invoiceValue ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    // Unique invoice number
    const existing = await Invoice.findOne({
      where: { invoiceNo: data.invoiceNo },
    });

    if (existing) {
      throw new Error("Invoice number already exists");
    }

    // Validate Supplier
    const supplier = await Supplier.findByPk(data.supplierId);
    if (!supplier) {
      throw new Error("Invalid supplierId");
    }

    // Validate Sales Order (optional)
    if (data.salesOrderId) {
      const order = await SalesOrder.findByPk(data.salesOrderId);
      if (!order) {
        throw new Error("Invalid salesOrderId");
      }
    }

    // Prepare details
    const detailsToCreate = data.details.map((detail) => ({
      wasteName: detail.wasteName,
      lotNo: detail.lotNo,
      baleNo: detail.baleNo,
      grossWt: parseFloat(detail.grossWt) || 0,
      tareWt: parseFloat(detail.tareWt) || 0,
      netWt: parseFloat(detail.netWt) || 0,
    }));

    // Create Invoice Header
    const invoice = await Invoice.create(
      {
        invoiceNo: data.invoiceNo,
        date: data.date,
        invoiceType: data.invoiceType,
        supplierId: data.supplierId,
        address: data.address,

        assessableValue: parseFloat(data.assessableValue),
        charity: parseFloat(data.charity) || 0,
        vatTax: parseFloat(data.vatTax) || 0,
        cenvat: parseFloat(data.cenvat) || 0,
        duty: parseFloat(data.duty) || 0,
        cess: parseFloat(data.cess) || 0,
        hsCess: parseFloat(data.hsCess) || 0,
        tcs: parseFloat(data.tcs) || 0,
        pfCharges: parseFloat(data.pfCharges) || 0,

        subTotal: parseFloat(data.subTotal),
        roundOff: parseFloat(data.roundOff) || 0,
        invoiceValue: parseFloat(data.invoiceValue),

        gst: parseFloat(data.gst) || 0,
        igst: parseFloat(data.igst) || 0,

        creditDays: data.creditDays || 0,
        interestPercent: parseFloat(data.interestPercent) || 0,

        transport: data.transport,
        lrNo: data.lrNo,
        lrDate: data.lrDate,
        vehicleNo: data.vehicleNo,
        removalTime: data.removalTime,
        eBill: data.eBill,
        exportTo: data.exportTo,
        approve: data.approve || false,

        salesOrderId: data.salesOrderId,
      },
      { transaction }
    );

    // Create Invoice Details
    await InvoiceDetail.bulkCreate(
      detailsToCreate.map((d) => ({
        ...d,
        invoiceId: invoice.id,
      })),
      { transaction }
    );

    await transaction.commit();

    return await Invoice.findByPk(invoice.id, {
      include: [
        { model: InvoiceDetail, as: "details" },
        { model: SalesOrder, as: "salesOrder" },
        { model: Supplier, as: "supplier" },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async () => {
  return await Invoice.findAll({
    include: [
      { model: InvoiceDetail, as: "details" },
      { model: SalesOrder, as: "salesOrder" },
      { model: Supplier, as: "supplier" },
    ],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const invoice = await Invoice.findByPk(id, {
    include: [
      { model: InvoiceDetail, as: "details" },
      { model: SalesOrder, as: "salesOrder" },
      { model: Supplier, as: "supplier" },
    ],
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  return invoice;
};

export const update = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const invoice = await Invoice.findByPk(id, { transaction });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Unique invoice number check
    if (data.invoiceNo && data.invoiceNo !== invoice.invoiceNo) {
      const existing = await Invoice.findOne({
        where: { invoiceNo: data.invoiceNo, id: { [Op.ne]: id } },
      });

      if (existing) {
        throw new Error("Invoice number already exists");
      }
    }

    // Validate supplier
    if (data.supplierId) {
      const supplier = await Supplier.findByPk(data.supplierId);
      if (!supplier) {
        throw new Error("Invalid supplierId");
      }
    }

    // Validate sales order
    if (data.salesOrderId) {
      const order = await SalesOrder.findByPk(data.salesOrderId);
      if (!order) {
        throw new Error("Invalid salesOrderId");
      }
    }

    await invoice.update(
      {
        invoiceNo: data.invoiceNo ?? invoice.invoiceNo,
        date: data.date ?? invoice.date,
        invoiceType: data.invoiceType ?? invoice.invoiceType,
        supplierId: data.supplierId ?? invoice.supplierId,
        address: data.address ?? invoice.address,

        assessableValue:
          data.assessableValue !== undefined
            ? parseFloat(data.assessableValue)
            : invoice.assessableValue,

        charity:
          data.charity !== undefined
            ? parseFloat(data.charity)
            : invoice.charity,

        vatTax:
          data.vatTax !== undefined
            ? parseFloat(data.vatTax)
            : invoice.vatTax,

        subTotal:
          data.subTotal !== undefined
            ? parseFloat(data.subTotal)
            : invoice.subTotal,

        roundOff:
          data.roundOff !== undefined
            ? parseFloat(data.roundOff)
            : invoice.roundOff,

        invoiceValue:
          data.invoiceValue !== undefined
            ? parseFloat(data.invoiceValue)
            : invoice.invoiceValue,

        salesOrderId: data.salesOrderId ?? invoice.salesOrderId,
      },
      { transaction }
    );

    if (data.details && Array.isArray(data.details)) {
      await InvoiceDetail.destroy({
        where: { invoiceId: id },
        transaction,
      });

      const newDetails = data.details.map((d) => ({
        invoiceId: id,
        wasteName: d.wasteName,
        lotNo: d.lotNo,
        baleNo: d.baleNo,
        grossWt: parseFloat(d.grossWt) || 0,
        tareWt: parseFloat(d.tareWt) || 0,
        netWt: parseFloat(d.netWt) || 0,
      }));

      await InvoiceDetail.bulkCreate(newDetails, { transaction });
    }

    await transaction.commit();

    return await Invoice.findByPk(id, {
      include: [
        { model: InvoiceDetail, as: "details" },
        { model: SalesOrder, as: "salesOrder" },
        { model: Supplier, as: "supplier" },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const remove = async (id) => {
  const invoice = await Invoice.findByPk(id);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  await invoice.destroy();
};