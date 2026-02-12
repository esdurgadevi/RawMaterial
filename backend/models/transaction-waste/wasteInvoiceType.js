import { DataTypes } from "sequelize";

const WasteInvoiceTypeModel = (sequelize) => {
  const WasteInvoiceType = sequelize.define(
    "WasteInvoiceType",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      invoiceType: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
        field: "invoice_type",
      },
      // Boolean flags for which components are applicable
      assessValue: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "assess_value",
      },
      charity: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tax: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      gst: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      igst: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      duty: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      cess: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hrSecCess: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "hr_sec_cess",
      },
      tcs: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      cst: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      cenvat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      subTotal: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "sub_total",
      },
      totalValue: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "total_value",
      },
      roundOff: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "round_off",
      },
      packingForwardingCharges: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "packing_forwarding_charges",
      },
      // Additional fields from screenshot
      roundOffDigits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "round_off_digits",
      },
      gstPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        field: "gst_percentage",
      },
      cgstPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        field: "cgst_percentage",
      },
      sgstPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        field: "sgst_percentage",
      },
    },
    {
      tableName: "waste_invoice_types",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["invoice_type"] },
      ],
    }
  );

  return WasteInvoiceType;
};

export default WasteInvoiceTypeModel;