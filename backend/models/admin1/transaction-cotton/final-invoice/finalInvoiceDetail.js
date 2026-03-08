// models/finalInvoiceDetail.js
import { DataTypes } from "sequelize";

const FinalInvoiceDetailModel = (sequelize) => {
  const FinalInvoiceDetail = sequelize.define(
    "FinalInvoiceDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // Foreign Keys
      finalInvoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "final_invoice_id",
        references: {
          model: "final_invoice_heads",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      inwardLotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "inward_lot_id",
        references: {
          model: "inward_lots", // ← adjust to your actual inward lot table name
          key: "id",
        },
        onDelete: "RESTRICT", // or CASCADE depending on business rule
        onUpdate: "CASCADE",
      },

      // Basic
      factor: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
        defaultValue: 1.000,
      },

      // Charges
      insurance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      charityBale: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      charity: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      eduCessPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      eduCess: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      hsCessPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      hsCess: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      tngstPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      tngst: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      taxType: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      taxPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      tax: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      commissionValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      roundOff: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      netAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      invValueOC: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      invValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      // Transport & LR
      permitNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      transport: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      lrNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      lrDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      totalLRValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      lrPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      lrValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      // Service Tax Section
      serviceTaxPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      serviceTax: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      eduCess2Percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      eduCess2: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      hsCess2Percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      hsCess2: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      // TDS
      tdsPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      tds: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      // Company Broker
      companyBrokerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // TCS
      tcsPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      tcsAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "final_invoice_details",
      timestamps: true,
      indexes: [
        { fields: ["final_invoice_id"] },
        { fields: ["inward_lot_id"] },
      ],
    }
  );

  return FinalInvoiceDetail;
};

export default FinalInvoiceDetailModel;