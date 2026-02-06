// models/invoiceModel.js
import { DataTypes } from "sequelize";

const InvoiceModel = (sequelize) => {
  const Invoice = sequelize.define(
    "Invoice",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      invoiceType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      partyName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      assessableValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      charity: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      vatTax: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      cenvat: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      duty: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      cess: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      hsCess: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      tcs: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      pfCharges: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      subTotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      roundOff: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      invoiceValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      gst: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      igst: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      creditDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      interestPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      transport: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lrNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      lrDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      vehicleNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      removalTime: {
        type: DataTypes.STRING(20), // e.g., "12/01/2026 12:00:00"
        allowNull: true,
      },
      eBill: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      exportTo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      approve: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      salesOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "sales_orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "invoices",
      timestamps: true,
    }
  );

  return Invoice;
};

export default InvoiceModel;