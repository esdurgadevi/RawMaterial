import db from "../../../models/index.js";
import { getNextInwardNo } from "../../../utils/helpers.js";

const {
  InwardEntry,
  PurchaseOrder,
  Godown,
  Supplier,
  Broker,
  Variety,
  MixingGroup,
  Station,
  CompanyBroker,
} = db;

export const createInwardEntry = async (data) => {
  if (!data.inwardDate) {
    throw new Error("Inward Date is required");
  }

  if (!data.inwardNo) {
    data.inwardNo = await getNextInwardNo();
  }

  // Convert safely
  const qty = Number(data.Qty || 0);
  const grossWeight = Number(data.grossWeight || 0);
  const tareWeight = Number(data.tareWeight || 0);
  const freight = Number(data.freight || 0);

  // Helper for display only
  const round2 = (value) => Math.round(value * 100) / 100;

  // ✅ Store EXACT values (no rounding)
  data.grossPerQty = qty > 0 ? grossWeight / qty : 0;
  data.tarePerQty = qty > 0 ? tareWeight / qty : 0;
  data.freightPerQty = qty > 0 ? freight / qty : 0;

  // ✅ Optional: store rounded values separately (for UI/report)
  data.grossPerQtyDisplay = qty > 0 ? round2(grossWeight / qty) : 0;
  data.tarePerQtyDisplay = qty > 0 ? round2(tareWeight / qty) : 0;
  data.freightPerQtyDisplay = qty > 0 ? round2(freight / qty) : 0;

  // ✅ Extra safety check (optional but good)
  if (qty <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  return await InwardEntry.create(data);
};

export const getAllInwardEntries = async () => {
  const entries = await InwardEntry.findAll({
    attributes: ["id", "inwardNo", "Qty", "nettWeight","inwardDate"],
    include: [
      {
        model: PurchaseOrder,
        as: "purchaseOrder",
        attributes: ["candyRate", "orderNo"],
      },
    ],
    order: [["inwardNo", "DESC"]],
  });

  return entries.map((entry) => ({
    id: entry.id,
    inwardNo: entry.inwardNo,
    noOfBales: entry.Qty,
    nettWeight: entry.nettWeight,
    candyRate: entry.purchaseOrder?.candyRate || null,
    purchaseOrderNo: entry.purchaseOrder?.orderNo || null,
    
    // Added timestamps
    inwardDate:entry.inwardDate
  }));
};
export const getInwardEntryById = async (id) => {
  const entry = await InwardEntry.findByPk(id, {
    include: [
      {
        model: Godown,
        as: "godown",
        attributes: ["godownName"],
      },
      {
        model: PurchaseOrder,
        as: "purchaseOrder",
        include: [
          { model: Supplier, as: "supplier", attributes: ["accountName"] },
          { model: Broker, as: "broker", attributes: ["brokerName"] },
          { model: Variety, as: "variety", attributes: ["variety"] },
          { model: MixingGroup, as: "mixingGroup", attributes: ["mixingName"] },
          { model: Station, as: "station", attributes: ["station"] },
          {
            model: CompanyBroker,
            as: "companyBroker",
            attributes: ["companyName"],
          },
        ],
        attributes: [
          "orderNo",
          "orderDate",
          "quantity",
          "candyRate",
          "packingType",
          "orderType",
        ],
      },
    ],
  });

  if (!entry) {
    throw new Error("Inward entry not found");
  }

  const data = entry.toJSON();

  // Build clean flat object
  return {
    // Inward core fields
    id: data.id,
    inwardNo: data.inwardNo,
    inwardDate: data.inwardDate,
    type: data.type,
    lcNo: data.lcNo,
    paymentDays: data.paymentDays,
    paymentDate: data.paymentDate,
    govtForm: data.govtForm,
    remarks: data.remarks,

    // Weight & Qty
    Qty: data.Qty,
    grossWeight: data.grossWeight,
    tareWeight: data.tareWeight,
    nettWeight: data.nettWeight,
    grossPerQty: data.grossPerQty,
    tarePerQty: data.tarePerQty,
    freightPerQty: data.freightPerQty,

    // Party & Bill details
    billNo: data.billNo,
    billDate: data.billDate,
    lotNo: data.lotNo,
    lorryNo: data.lorryNo,
    date: data.date,
    candyRate: data.candyRate,
    pMark: data.pMark,
    pressRunningNo: data.pressRunningNo,
    commisType: data.commisType,
    commisValue: data.commisValue,
    permitNo: data.permitNo,
    comm: data.comm,

    // Charges & Taxes
    freight: data.freight,
    cooly: data.cooly,
    bale: data.bale,
    gst: data.gst,
    sgst: data.sgst,
    cgst: data.cgst,
    igst: data.igst,
    sgstAmount: data.sgstAmount,
    cgstAmount: data.cgstAmount,
    igstAmount: data.igstAmount,
    Tax: data.Tax,
    TaxRs: data.TaxRs,

    // Resolved names
    godownName: data.godown?.godownName || null,
    supplier: data.purchaseOrder?.supplier?.accountName || null,
    broker: data.purchaseOrder?.broker?.brokerName || null,
    variety: data.purchaseOrder?.variety?.variety || null,
    mixingGroup: data.purchaseOrder?.mixingGroup?.mixingName || null,
    station: data.purchaseOrder?.station?.station || null,
    companyBroker: data.purchaseOrder?.companyBroker?.companyName || null,

    // Useful fields from purchase order
    purchaseOrderNo: data.purchaseOrder?.orderNo || null,
    purchaseOrderDate: data.purchaseOrder?.orderDate || null,
    purchaseQuantity: data.purchaseOrder?.quantity || null,
    purchaseCandyRate: data.purchaseOrder?.candyRate || null,

    // Added timestamps
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};
/* =========================
   UPDATE
========================= */
export const updateInwardEntry = async (id, data) => {
  const entry = await InwardEntry.findByPk(id);
  if (!entry) throw new Error("Inward entry not found");

  const qty = Number(data.Qty ?? entry.Qty ?? 0);

  data.grossPerQty =
    qty > 0
      ? Number(data.grossWeight ?? entry.grossWeight ?? 0) / qty
      : 0;

  data.tarePerQty =
    qty > 0
      ? Number(data.tareWeight ?? entry.tareWeight ?? 0) / qty
      : 0;

  data.freightPerQty =
    qty > 0
      ? Number(data.freight ?? entry.freight ?? 0) / qty
      : 0;

  return await entry.update(data);
};

/* =========================
   DELETE
========================= */
export const deleteInwardEntry = async (id) => {
  const entry = await InwardEntry.findByPk(id);
  if (!entry) throw new Error("Inward entry not found");
  await entry.destroy();
};