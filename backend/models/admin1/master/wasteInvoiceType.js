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
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
      roundOffDigits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      assessValueFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "[Total Kgs]*([Rate / kg]/[Rate Per])",
      },
      charityBale: {
        type: DataTypes.NUMERIC(10, 2),
        defaultValue: 0,
      },
      charityFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "[Total Kgs]*[CharityRs]",
      },
      taxVat: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 0,
      },
      taxVatFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "-",
      },
      gst: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 5.00,
      },
      cgstFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "Round(([X]*[CGST %])/100)",
      },
      sgstFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "Round(([X]*[SGST %])/100)",
      },
      igst: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 0,
      },
      igstFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "-",
      },
      duty: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 0,
      },
      dutyFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "-",
      },
      cess: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 1.00,
      },
      cessFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "([X]*[ChessRs])/100",
      },
      hrSecCess: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 0,
      },
      hrSecCessFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "-",
      },
      tcs: {
        type: DataTypes.NUMERIC(5, 3),
        defaultValue: 0.750,
      },
      tcsFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "([X]*[TCSRs])/100",
      },
      cst: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 0,
      },
      cstFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "-",
      },
      cenvat: {
        type: DataTypes.NUMERIC(5, 2),
        defaultValue: 0,
      },
      cenvatFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "-",
      },
      subTotalFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "[X]+[D]+[F]",
      },
      totalValueFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "[H]+[GstAmt]+[IGstAmt]",
      },
      roundOffFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "ROUND OFF",
      },
      packingForwardingFormula: {
        type: DataTypes.STRING(255),
        defaultValue: "-",
      },
      accPosting: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "waste_invoice_types",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["code"],
        },
      ],
    }
  );

  return WasteInvoiceType;
};

export default WasteInvoiceTypeModel;